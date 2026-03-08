import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MenuService } from '../menu/menu.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { VapiPromptBuilder } from './vapi-prompt-builder';

interface VapiAssistantConfig {
  name: string;
  model: {
    provider: string;
    model: string;
    systemPrompt: string;
    temperature: number;
    tools: VapiTool[];
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  firstMessage: string;
  endCallMessage: string;
  serverUrl: string;
  serverUrlSecret: string;
  silenceTimeoutSeconds: number;
  maxDurationSeconds: number;
  backgroundSound: string;
  backchannelingEnabled: boolean;
  recordingEnabled: boolean;
  hipaaEnabled: boolean;
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
}

interface VapiTool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  };
  server?: {
    url: string;
  };
}

interface VapiPhoneNumber {
  id: string;
  number: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
}

@Injectable()
export class VapiService {
  private readonly logger = new Logger(VapiService.name);
  private readonly baseUrl = 'https://api.vapi.ai';
  private readonly apiKey: string;
  private readonly serverUrl: string;
  private readonly serverSecret: string;
  private readonly promptBuilder: VapiPromptBuilder;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly menuService: MenuService,
    private readonly restaurantsService: RestaurantsService,
  ) {
    this.apiKey = this.config.getOrThrow('VAPI_API_KEY');
    this.serverUrl = this.config.getOrThrow('VAPI_SERVER_URL');
    this.serverSecret = this.config.getOrThrow('VAPI_SERVER_SECRET');
    this.promptBuilder = new VapiPromptBuilder();
  }

  // ---- Assistant Management ----

  /**
   * Create a new Vapi assistant for a restaurant.
   * Each restaurant gets its own AI assistant with a customized
   * system prompt containing their menu, hours, and policies.
   */
  async createAssistant(restaurantId: string): Promise<string> {
    const restaurant = await this.restaurantsService.findById(restaurantId);
    const menu = await this.menuService.getMenuForAI(restaurantId);

    const config = this.buildAssistantConfig(restaurant, menu);

    const response = await this.vapiRequest('POST', '/assistant', config);

    const assistantId = response.id;

    // Save the assistant ID to the restaurant
    await this.restaurantsService.updateVapiAssistant(restaurantId, assistantId);

    this.logger.log(
      `Vapi assistant created: ${assistantId} for restaurant ${restaurant.name}`,
    );

    return assistantId;
  }

  /**
   * Update an existing assistant when the restaurant's menu or settings change.
   */
  async updateAssistant(restaurantId: string): Promise<void> {
    const restaurant = await this.restaurantsService.findById(restaurantId);

    if (!restaurant.vapiAssistantId) {
      throw new BadRequestException(
        `Restaurant ${restaurant.name} does not have a Vapi assistant. Create one first.`,
      );
    }

    const menu = await this.menuService.getMenuForAI(restaurantId);
    const config = this.buildAssistantConfig(restaurant, menu);

    await this.vapiRequest('PATCH', `/assistant/${restaurant.vapiAssistantId}`, config);

    this.logger.log(
      `Vapi assistant updated: ${restaurant.vapiAssistantId} for ${restaurant.name}`,
    );
  }

  /**
   * Delete a Vapi assistant (e.g., when a restaurant deactivates).
   */
  async deleteAssistant(restaurantId: string): Promise<void> {
    const restaurant = await this.restaurantsService.findById(restaurantId);

    if (!restaurant.vapiAssistantId) return;

    await this.vapiRequest('DELETE', `/assistant/${restaurant.vapiAssistantId}`);

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { vapiAssistantId: null },
    });

    this.logger.log(`Vapi assistant deleted for restaurant ${restaurant.name}`);
  }

  /**
   * Get the current assistant config from Vapi.
   */
  async getAssistant(assistantId: string): Promise<any> {
    return this.vapiRequest('GET', `/assistant/${assistantId}`);
  }

  // ---- Phone Number Management ----

  /**
   * Import a Twilio phone number into Vapi and link it to a restaurant's assistant.
   */
  async importPhoneNumber(
    restaurantId: string,
    twilioPhoneNumber: string,
  ): Promise<VapiPhoneNumber> {
    const restaurant = await this.restaurantsService.findById(restaurantId);

    if (!restaurant.vapiAssistantId) {
      throw new BadRequestException(
        'Create a Vapi assistant for this restaurant first.',
      );
    }

    const twilioSid = this.config.getOrThrow('TWILIO_ACCOUNT_SID');
    const twilioAuth = this.config.getOrThrow('TWILIO_AUTH_TOKEN');

    const response = await this.vapiRequest('POST', '/phone-number', {
      provider: 'twilio',
      number: twilioPhoneNumber,
      twilioAccountSid: twilioSid,
      twilioAuthToken: twilioAuth,
      assistantId: restaurant.vapiAssistantId,
    });

    // Save the Twilio phone number to the restaurant
    await this.restaurantsService.updateTwilioPhone(
      restaurantId,
      twilioPhoneNumber,
    );

    this.logger.log(
      `Phone number ${twilioPhoneNumber} imported for ${restaurant.name}`,
    );

    return response;
  }

  /**
   * List all phone numbers registered with Vapi.
   */
  async listPhoneNumbers(): Promise<VapiPhoneNumber[]> {
    return this.vapiRequest('GET', '/phone-number');
  }

  // ---- Call Management ----

  /**
   * Initiate an outbound call via Vapi (e.g., for order confirmation callbacks).
   */
  async createOutboundCall(
    assistantId: string,
    customerPhone: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    return this.vapiRequest('POST', '/call/phone', {
      assistantId,
      customer: {
        number: customerPhone,
      },
      metadata,
    });
  }

  /**
   * Get call details from Vapi.
   */
  async getCall(callId: string): Promise<any> {
    return this.vapiRequest('GET', `/call/${callId}`);
  }

  // ---- Assistant Configuration Builder ----

  private buildAssistantConfig(
    restaurant: any,
    menu: any[],
  ): VapiAssistantConfig {
    const systemPrompt = this.promptBuilder.buildSystemPrompt(
      restaurant,
      menu,
    );

    return {
      name: `Calley AI - ${restaurant.name}`,
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt,
        temperature: 0.3,
        tools: this.buildTools(),
      },
      voice: {
        provider: 'elevenlabs',
        voiceId: 'rachel', // Warm, professional female voice
      },
      firstMessage: `Hi! Thanks for calling ${restaurant.name}. I'm your AI ordering assistant. I can help you place an order, check our menu, or answer any questions. What can I get for you today?`,
      endCallMessage:
        'Thank you for your order! We\'ll have it ready for you soon. Have a great day!',
      serverUrl: `${this.serverUrl}/webhooks/vapi`,
      serverUrlSecret: this.serverSecret,
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600, // 10 minute max call
      backgroundSound: 'off',
      backchannelingEnabled: true,
      recordingEnabled: true,
      hipaaEnabled: false,
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en',
      },
    };
  }

  /**
   * Build the tool definitions (function calls) that the AI can invoke
   * during a conversation. These are the "actions" the voice agent can take.
   */
  private buildTools(): VapiTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'get_menu',
          description:
            'Get the full restaurant menu with categories, items, prices, and available modifiers. Call this when the customer asks about the menu, what\'s available, prices, or specific items.',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description:
                  'Optional: filter by category (e.g., "appetizers", "entrees", "drinks"). Leave empty for the full menu.',
              },
            },
          },
        },
        server: { url: `${this.serverUrl}/webhooks/vapi/function` },
      },
      {
        type: 'function',
        function: {
          name: 'add_to_order',
          description:
            'Add an item to the customer\'s current order. Call this when the customer says they want a specific menu item. Always confirm the item name and any modifiers before calling.',
          parameters: {
            type: 'object',
            properties: {
              item_name: {
                type: 'string',
                description: 'The exact name of the menu item to add',
              },
              quantity: {
                type: 'number',
                description: 'Number of this item to add (default: 1)',
              },
              modifiers: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'List of modifier names to apply (e.g., ["extra cheese", "no onions"])',
              },
              special_instructions: {
                type: 'string',
                description:
                  'Any special instructions for this item (e.g., "well done", "on the side")',
              },
            },
            required: ['item_name'],
          },
        },
        server: { url: `${this.serverUrl}/webhooks/vapi/function` },
      },
      {
        type: 'function',
        function: {
          name: 'remove_from_order',
          description:
            'Remove an item from the customer\'s current order. Call this when the customer wants to remove something they previously added.',
          parameters: {
            type: 'object',
            properties: {
              item_name: {
                type: 'string',
                description: 'The name of the menu item to remove',
              },
            },
            required: ['item_name'],
          },
        },
        server: { url: `${this.serverUrl}/webhooks/vapi/function` },
      },
      {
        type: 'function',
        function: {
          name: 'get_order_summary',
          description:
            'Get a summary of the customer\'s current order with items, modifiers, and total price. Call this when the customer asks to review their order or before confirming/placing.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
        server: { url: `${this.serverUrl}/webhooks/vapi/function` },
      },
      {
        type: 'function',
        function: {
          name: 'place_order',
          description:
            'Finalize and place the customer\'s order. Only call this AFTER reading back the complete order and getting explicit confirmation from the customer.',
          parameters: {
            type: 'object',
            properties: {
              customer_name: {
                type: 'string',
                description: 'Customer\'s name for the order',
              },
              pickup_time: {
                type: 'string',
                description:
                  'Requested pickup time (e.g., "ASAP", "30 minutes", "6:00 PM")',
              },
            },
            required: ['customer_name'],
          },
        },
        server: { url: `${this.serverUrl}/webhooks/vapi/function` },
      },
      {
        type: 'function',
        function: {
          name: 'check_hours',
          description:
            'Check the restaurant\'s current business hours and whether they are currently open. Call this when the customer asks about hours or availability.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
        server: { url: `${this.serverUrl}/webhooks/vapi/function` },
      },
      {
        type: 'function',
        function: {
          name: 'transfer_to_human',
          description:
            'Transfer the call to a human staff member. Only use this when the customer explicitly requests to speak to a person, or when you cannot handle their request.',
          parameters: {
            type: 'object',
            properties: {
              reason: {
                type: 'string',
                description: 'Reason for the transfer',
              },
            },
            required: ['reason'],
          },
        },
        server: { url: `${this.serverUrl}/webhooks/vapi/function` },
      },
    ];
  }

  // ---- HTTP Client ----

  private async vapiRequest(
    method: string,
    path: string,
    body?: any,
  ): Promise<any> {
    const url = `${this.baseUrl}${path}`;

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Vapi API error [${method} ${path}]: ${response.status} - ${error}`);
        throw new BadRequestException(
          `Vapi API error: ${response.status} - ${error}`,
        );
      }

      if (method === 'DELETE') return { deleted: true };

      return response.json();
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Vapi API request failed [${method} ${path}]: ${error.message}`);
      throw new BadRequestException(`Failed to reach Vapi API: ${error.message}`);
    }
  }
}
