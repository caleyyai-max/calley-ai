import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuService } from '../menu/menu.service';
import { OrdersService } from '../orders/orders.service';
import { RestaurantsService } from '../restaurants/restaurants.service';

/**
 * In-memory cart for active calls.
 * Each call has its own cart that persists for the duration of the call.
 * When the call ends, the cart is cleaned up.
 */
interface CartItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: { id: string; name: string; price: number }[];
  specialInstructions?: string;
}

interface ActiveCart {
  restaurantId: string;
  customerPhone: string;
  callId: string;
  items: CartItem[];
  createdAt: Date;
}

@Injectable()
export class VapiFunctionHandler {
  private readonly logger = new Logger(VapiFunctionHandler.name);

  /**
   * Active carts indexed by Vapi call ID.
   * These live in memory during the call and are cleaned up after.
   */
  private activeCarts = new Map<string, ActiveCart>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly menuService: MenuService,
    private readonly ordersService: OrdersService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  /**
   * Main dispatcher: routes Vapi function calls to the appropriate handler.
   * Returns the result string that Vapi will speak to the customer.
   */
  async handleFunctionCall(
    functionName: string,
    parameters: Record<string, any>,
    callContext: {
      callId: string;
      restaurantId: string;
      customerPhone: string;
    },
  ): Promise<string> {
    this.logger.log(
      `Function call: ${functionName} | Call: ${callContext.callId} | Params: ${JSON.stringify(parameters)}`,
    );

    // Ensure a cart exists for this call
    if (!this.activeCarts.has(callContext.callId)) {
      this.activeCarts.set(callContext.callId, {
        restaurantId: callContext.restaurantId,
        customerPhone: callContext.customerPhone,
        callId: callContext.callId,
        items: [],
        createdAt: new Date(),
      });
    }

    try {
      switch (functionName) {
        case 'get_menu':
          return this.handleGetMenu(
            callContext.restaurantId,
            parameters.category,
          );

        case 'add_to_order':
          return this.handleAddToOrder(
            callContext.callId,
            callContext.restaurantId,
            parameters,
          );

        case 'remove_from_order':
          return this.handleRemoveFromOrder(
            callContext.callId,
            parameters.item_name,
          );

        case 'get_order_summary':
          return this.handleGetOrderSummary(callContext.callId);

        case 'place_order':
          return this.handlePlaceOrder(
            callContext.callId,
            parameters,
          );

        case 'check_hours':
          return this.handleCheckHours(callContext.restaurantId);

        case 'transfer_to_human':
          return this.handleTransferToHuman(
            callContext.restaurantId,
            parameters.reason,
          );

        default:
          this.logger.warn(`Unknown function call: ${functionName}`);
          return 'I\'m sorry, I wasn\'t able to process that request. Could you try again?';
      }
    } catch (error: any) {
      this.logger.error(
        `Function call error [${functionName}]: ${error.message}`,
        error.stack,
      );
      return 'I\'m sorry, I ran into a technical issue. Could you repeat that?';
    }
  }

  // ---- Function Handlers ----

  /**
   * Get the restaurant's menu, optionally filtered by category.
   * Returns a natural language description for the AI to read.
   */
  private async handleGetMenu(
    restaurantId: string,
    category?: string,
  ): Promise<string> {
    const menuData = await this.menuService.getMenuForAI(restaurantId);

    if (!menuData || menuData.length === 0) {
      return 'The menu is currently being updated. Please check back shortly.';
    }

    let items = menuData;
    if (category) {
      items = menuData.filter(
        (item) =>
          item.category.toLowerCase().includes(category.toLowerCase()),
      );

      if (items.length === 0) {
        const categories = [...new Set(menuData.map((i) => i.category))];
        return `We don't have a "${category}" category. Our categories are: ${categories.join(', ')}. Which would you like to hear about?`;
      }
    }

    // Format for speech
    const grouped: Record<string, any[]> = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    let response = '';
    for (const [cat, catItems] of Object.entries(grouped)) {
      response += `In ${cat}, we have: `;
      response += catItems
        .map((i) => {
          let desc = `${i.name} for ${i.price}`;
          if (i.description) desc += ` — ${i.description}`;
          return desc;
        })
        .join('. ');
      response += '. ';
    }

    return response.trim();
  }

  /**
   * Add an item to the customer's cart.
   * Fuzzy-matches item names against the menu and resolves modifiers.
   */
  private async handleAddToOrder(
    callId: string,
    restaurantId: string,
    params: {
      item_name: string;
      quantity?: number;
      modifiers?: string[];
      special_instructions?: string;
    },
  ): Promise<string> {
    const cart = this.activeCarts.get(callId)!;
    const quantity = params.quantity || 1;

    // Find the menu item (fuzzy match)
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
      },
      include: { modifiers: true },
    });

    const matchedItem = this.fuzzyMatchItem(params.item_name, menuItems);

    if (!matchedItem) {
      // Suggest similar items
      const suggestions = this.getSimilarItems(params.item_name, menuItems, 3);
      if (suggestions.length > 0) {
        return `I couldn't find "${params.item_name}" on the menu. Did you mean: ${suggestions.map((s) => s.name).join(', ')}?`;
      }
      return `I'm sorry, I couldn't find "${params.item_name}" on our menu. Would you like to hear what we have available?`;
    }

    // Resolve modifiers
    const resolvedModifiers: { id: string; name: string; price: number }[] = [];
    if (params.modifiers && params.modifiers.length > 0) {
      for (const modName of params.modifiers) {
        const matchedMod = matchedItem.modifiers.find(
          (m) => m.name.toLowerCase().includes(modName.toLowerCase()),
        );
        if (matchedMod) {
          resolvedModifiers.push({
            id: matchedMod.id,
            name: matchedMod.name,
            price: Number(matchedMod.price),
          });
        }
      }
    }

    // Add to cart
    const cartItem: CartItem = {
      menuItemId: matchedItem.id,
      name: matchedItem.name,
      quantity,
      unitPrice: Number(matchedItem.price),
      modifiers: resolvedModifiers,
      specialInstructions: params.special_instructions,
    };

    cart.items.push(cartItem);

    // Build confirmation message
    const itemTotal =
      (cartItem.unitPrice +
        resolvedModifiers.reduce((sum, m) => sum + m.price, 0)) *
      quantity;

    let confirmation = `Got it! I've added `;
    if (quantity > 1) confirmation += `${quantity}x `;
    confirmation += matchedItem.name;

    if (resolvedModifiers.length > 0) {
      confirmation += ` with ${resolvedModifiers.map((m) => m.name).join(' and ')}`;
    }

    if (params.special_instructions) {
      confirmation += ` (${params.special_instructions})`;
    }

    confirmation += ` — that's $${itemTotal.toFixed(2)}`;
    confirmation += '. Would you like anything else?';

    return confirmation;
  }

  /**
   * Remove an item from the customer's cart.
   */
  private handleRemoveFromOrder(
    callId: string,
    itemName: string,
  ): string {
    const cart = this.activeCarts.get(callId)!;

    const index = cart.items.findIndex(
      (item) =>
        item.name.toLowerCase().includes(itemName.toLowerCase()),
    );

    if (index === -1) {
      const currentItems = cart.items.map((i) => i.name).join(', ');
      if (cart.items.length === 0) {
        return 'Your order is currently empty, so there\'s nothing to remove.';
      }
      return `I don't see "${itemName}" in your order. Your current items are: ${currentItems}. Which one would you like to remove?`;
    }

    const removed = cart.items.splice(index, 1)[0];
    return `I've removed the ${removed.name} from your order. ${cart.items.length === 0 ? 'Your order is now empty.' : 'Would you like anything else?'}`;
  }

  /**
   * Get the current order summary with totals.
   */
  private handleGetOrderSummary(callId: string): string {
    const cart = this.activeCarts.get(callId)!;

    if (cart.items.length === 0) {
      return 'Your order is currently empty. What would you like to order?';
    }

    let subtotal = 0;
    const itemDescriptions: string[] = [];

    for (const item of cart.items) {
      const modifierTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0);
      const itemTotal = (item.unitPrice + modifierTotal) * item.quantity;
      subtotal += itemTotal;

      let desc = '';
      if (item.quantity > 1) desc += `${item.quantity}x `;
      desc += item.name;

      if (item.modifiers.length > 0) {
        desc += ` with ${item.modifiers.map((m) => m.name).join(', ')}`;
      }

      if (item.specialInstructions) {
        desc += ` (${item.specialInstructions})`;
      }

      desc += ` — $${itemTotal.toFixed(2)}`;
      itemDescriptions.push(desc);
    }

    const tax = subtotal * 0.08875; // Default tax rate
    const total = subtotal + tax;

    let summary = `Here's your order: ${itemDescriptions.join('; ')}. `;
    summary += `Subtotal is $${subtotal.toFixed(2)}, `;
    summary += `plus $${tax.toFixed(2)} tax, `;
    summary += `for a total of $${total.toFixed(2)}. `;
    summary += 'Does everything look correct?';

    return summary;
  }

  /**
   * Place the order: persist to database and clean up the cart.
   */
  private async handlePlaceOrder(
    callId: string,
    params: { customer_name?: string; pickup_time?: string },
  ): Promise<string> {
    const cart = this.activeCarts.get(callId)!;

    if (cart.items.length === 0) {
      return 'Your order is empty. Would you like to add some items first?';
    }

    // Find the call record to link the order
    let dbCallId: string | undefined;
    try {
      const callRecord = await this.prisma.call.findUnique({
        where: { vapiCallId: callId },
      });
      dbCallId = callRecord?.id;
    } catch {
      // Call record may not exist yet — that's OK
    }

    // Build the order DTO
    const orderDto = {
      restaurantId: cart.restaurantId,
      customerPhone: cart.customerPhone,
      callId: dbCallId,
      notes: [
        params.customer_name ? `Name: ${params.customer_name}` : null,
        params.pickup_time ? `Pickup: ${params.pickup_time}` : null,
        ...cart.items
          .filter((i) => i.specialInstructions)
          .map((i) => `${i.name}: ${i.specialInstructions}`),
      ]
        .filter(Boolean)
        .join(' | '),
      items: cart.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        modifierIds: item.modifiers.map((m) => m.id),
        notes: item.specialInstructions,
      })),
    };

    const order = await this.ordersService.create(orderDto);

    // Clean up the cart
    this.activeCarts.delete(callId);

    // Calculate estimated time
    const estimatedMinutes = Math.max(15, cart.items.length * 5 + 10);
    const pickupMsg =
      params.pickup_time && params.pickup_time.toLowerCase() !== 'asap'
        ? `for ${params.pickup_time}`
        : `in about ${estimatedMinutes} minutes`;

    let confirmation = 'Your order has been placed successfully! ';
    if (params.customer_name) {
      confirmation += `The order is under ${params.customer_name}. `;
    }
    confirmation += `It should be ready ${pickupMsg}. `;
    confirmation += `Your order number is ${order.id.slice(-6).toUpperCase()}. `;
    confirmation += 'Thank you for ordering!';

    this.logger.log(
      `Order placed: ${order.id} via call ${callId} for restaurant ${cart.restaurantId}`,
    );

    return confirmation;
  }

  /**
   * Check restaurant business hours.
   */
  private async handleCheckHours(restaurantId: string): Promise<string> {
    const restaurant = await this.restaurantsService.findById(restaurantId);

    // For now, return a standard message.
    // In production, this would read from a business_hours JSON field.
    return `${restaurant.name} is currently accepting orders. Our standard hours are Monday through Saturday, 11 AM to 10 PM, and Sunday 12 PM to 9 PM. Would you like to place an order?`;
  }

  /**
   * Transfer the call to a human staff member.
   */
  private async handleTransferToHuman(
    restaurantId: string,
    reason: string,
  ): Promise<string> {
    const restaurant = await this.restaurantsService.findById(restaurantId);

    this.logger.log(
      `Transfer requested for restaurant ${restaurant.name}: ${reason}`,
    );

    // In production, this would trigger a Twilio call transfer
    // to the restaurant's main phone line
    if (restaurant.phone) {
      return `I'll transfer you to our staff now. One moment please.`;
    }

    return `I'm sorry, there's no one available to take the call right now. Can I help you with your order instead, or would you like to call back during business hours?`;
  }

  // ---- Utility Methods ----

  /**
   * Fuzzy match an item name against the menu.
   * Handles common variations, abbreviations, and misspellings.
   */
  private fuzzyMatchItem(query: string, menuItems: any[]): any | null {
    const normalizedQuery = query.toLowerCase().trim();

    // Exact match first
    const exact = menuItems.find(
      (item) => item.name.toLowerCase() === normalizedQuery,
    );
    if (exact) return exact;

    // Contains match
    const contains = menuItems.find(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(item.name.toLowerCase()),
    );
    if (contains) return contains;

    // Word overlap scoring
    const queryWords = normalizedQuery.split(/\s+/);
    let bestMatch: any = null;
    let bestScore = 0;

    for (const item of menuItems) {
      const itemWords = item.name.toLowerCase().split(/\s+/);
      const overlap = queryWords.filter((w) =>
        itemWords.some((iw: string) => iw.includes(w) || w.includes(iw)),
      ).length;

      const score = overlap / Math.max(queryWords.length, itemWords.length);

      if (score > bestScore && score >= 0.4) {
        bestScore = score;
        bestMatch = item;
      }
    }

    return bestMatch;
  }

  /**
   * Get similar items for suggestions when a match isn't found.
   */
  private getSimilarItems(
    query: string,
    menuItems: any[],
    limit: number,
  ): any[] {
    const queryWords = query.toLowerCase().split(/\s+/);

    const scored = menuItems.map((item) => {
      const itemWords = item.name.toLowerCase().split(/\s+/);
      const overlap = queryWords.filter((w) =>
        itemWords.some((iw: string) => iw.includes(w) || w.includes(iw)),
      ).length;
      return { item, score: overlap };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.item);
  }

  /**
   * Clean up a cart when a call ends (called from webhook handler).
   */
  cleanupCart(callId: string): void {
    if (this.activeCarts.has(callId)) {
      this.activeCarts.delete(callId);
      this.logger.log(`Cart cleaned up for call ${callId}`);
    }
  }

  /**
   * Get cart for debugging/monitoring.
   */
  getCart(callId: string): ActiveCart | undefined {
    return this.activeCarts.get(callId);
  }
}
