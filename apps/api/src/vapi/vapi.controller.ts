import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VapiService } from './vapi.service';
import { VapiFunctionHandler } from './vapi-function-handler';

@ApiTags('Vapi AI')
@Controller('vapi')
export class VapiController {
  private readonly logger = new Logger(VapiController.name);

  constructor(
    private readonly vapiService: VapiService,
    private readonly functionHandler: VapiFunctionHandler,
    private readonly config: ConfigService,
  ) {}

  // ---- Assistant Management ----

  @Post('assistants/:restaurantId')
  @ApiOperation({ summary: 'Create a Vapi assistant for a restaurant' })
  @ApiResponse({ status: 201, description: 'Assistant created' })
  async createAssistant(@Param('restaurantId') restaurantId: string) {
    const assistantId = await this.vapiService.createAssistant(restaurantId);
    return {
      success: true,
      assistantId,
      message: 'AI voice assistant created and linked to restaurant',
    };
  }

  @Patch('assistants/:restaurantId')
  @ApiOperation({ summary: 'Update a restaurant\'s Vapi assistant (e.g., after menu changes)' })
  @ApiResponse({ status: 200, description: 'Assistant updated' })
  async updateAssistant(@Param('restaurantId') restaurantId: string) {
    await this.vapiService.updateAssistant(restaurantId);
    return {
      success: true,
      message: 'AI voice assistant updated with latest menu and settings',
    };
  }

  @Delete('assistants/:restaurantId')
  @ApiOperation({ summary: 'Delete a restaurant\'s Vapi assistant' })
  @ApiResponse({ status: 200, description: 'Assistant deleted' })
  async deleteAssistant(@Param('restaurantId') restaurantId: string) {
    await this.vapiService.deleteAssistant(restaurantId);
    return {
      success: true,
      message: 'AI voice assistant removed',
    };
  }

  @Get('assistants/:assistantId/details')
  @ApiOperation({ summary: 'Get assistant details from Vapi' })
  @ApiResponse({ status: 200, description: 'Assistant details' })
  async getAssistantDetails(@Param('assistantId') assistantId: string) {
    return this.vapiService.getAssistant(assistantId);
  }

  // ---- Phone Number Management ----

  @Post('phone-numbers/:restaurantId')
  @ApiOperation({ summary: 'Import a Twilio phone number and link to restaurant assistant' })
  @ApiResponse({ status: 201, description: 'Phone number imported' })
  async importPhoneNumber(
    @Param('restaurantId') restaurantId: string,
    @Body() body: { phoneNumber: string },
  ) {
    const result = await this.vapiService.importPhoneNumber(
      restaurantId,
      body.phoneNumber,
    );
    return {
      success: true,
      phoneNumberId: result.id,
      number: result.number,
      message: 'Phone number imported and linked to AI assistant',
    };
  }

  @Get('phone-numbers')
  @ApiOperation({ summary: 'List all registered phone numbers' })
  @ApiResponse({ status: 200, description: 'Phone numbers list' })
  async listPhoneNumbers() {
    return this.vapiService.listPhoneNumbers();
  }

  // ---- Outbound Calls ----

  @Post('calls/outbound')
  @ApiOperation({ summary: 'Initiate an outbound call (e.g., order confirmation)' })
  @ApiResponse({ status: 201, description: 'Call initiated' })
  async createOutboundCall(
    @Body()
    body: {
      assistantId: string;
      customerPhone: string;
      metadata?: Record<string, any>;
    },
  ) {
    const call = await this.vapiService.createOutboundCall(
      body.assistantId,
      body.customerPhone,
      body.metadata,
    );
    return {
      success: true,
      callId: call.id,
      message: 'Outbound call initiated',
    };
  }

  // ---- Vapi Function Call Webhook ----

  @Post('webhook/function')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vapi server-side function call webhook' })
  async handleFunctionCallWebhook(
    @Body() body: any,
    @Headers('x-vapi-secret') vapiSecret: string,
  ) {
    // Verify webhook secret
    const expectedSecret = this.config.get('VAPI_SERVER_SECRET');
    if (expectedSecret && vapiSecret !== expectedSecret) {
      this.logger.warn('Invalid Vapi webhook secret');
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const { message } = body;

    if (!message || message.type !== 'function-call') {
      return { result: 'Not a function call' };
    }

    const { functionCall, call } = message;

    if (!functionCall?.name || !call) {
      this.logger.warn('Function call webhook missing required fields');
      return { result: 'Missing function call data' };
    }

    // Resolve restaurant from the assistant ID
    const restaurantId = await this.resolveRestaurantId(call);

    if (!restaurantId) {
      this.logger.error(
        `Could not resolve restaurant for call ${call.id}`,
      );
      return {
        result:
          'I\'m sorry, I\'m having trouble connecting to the restaurant system. Please try calling again.',
      };
    }

    const result = await this.functionHandler.handleFunctionCall(
      functionCall.name,
      functionCall.parameters || {},
      {
        callId: call.id,
        restaurantId,
        customerPhone: call.customer?.number || 'unknown',
      },
    );

    return { result };
  }

  // ---- Vapi Status/End-of-Call Webhook ----

  @Post('webhook/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vapi call status and end-of-call webhook' })
  async handleStatusWebhook(
    @Body() body: any,
    @Headers('x-vapi-secret') vapiSecret: string,
  ) {
    const expectedSecret = this.config.get('VAPI_SERVER_SECRET');
    if (expectedSecret && vapiSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const { message } = body;

    if (!message) {
      return { received: true };
    }

    // Handle end-of-call: clean up in-memory cart
    if (message.type === 'end-of-call-report' && message.call?.id) {
      this.functionHandler.cleanupCart(message.call.id);
    }

    return { received: true };
  }

  // ---- Helpers ----

  /**
   * Resolve the restaurant ID from a Vapi call object.
   * Uses the assistant ID to find the restaurant.
   */
  private async resolveRestaurantId(call: any): Promise<string | null> {
    try {
      if (call.assistantId) {
        const restaurant = await this.vapiService
          ['prisma']
          .restaurant.findUnique({
            where: { vapiAssistantId: call.assistantId },
            select: { id: true },
          });
        return restaurant?.id || null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
