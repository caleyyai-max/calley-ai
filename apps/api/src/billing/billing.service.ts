import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import Stripe from "stripe";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.stripe = new Stripe(this.config.getOrThrow("STRIPE_SECRET_KEY"), {
      apiVersion: "2023-10-16",
    });
  }

  async createCheckoutSession(
    restaurantId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: restaurantId,
      metadata: { restaurantId },
    });

    this.logger.log(`Checkout session created: ${session.id} for restaurant ${restaurantId}`);
    return { sessionId: session.id, url: session.url };
  }

  async createPortalSession(restaurantId: string, returnUrl: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || !restaurant.stripeCustomerId) {
      throw new NotFoundException(`No Stripe customer found for restaurant ${restaurantId}`);
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: restaurant.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async getSubscription(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    }

    return {
      plan: restaurant.plan,
      stripeSubscriptionId: restaurant.stripeSubscriptionId,
      status: restaurant.plan !== "FREE" ? "active" : "none",
    };
  }

  async getUsage(restaurantId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [callCount, orderCount] = await Promise.all([
      this.prisma.call.count({
        where: { restaurantId, createdAt: { gte: since } },
      }),
      this.prisma.order.count({
        where: { restaurantId, createdAt: { gte: since } },
      }),
    ]);

    return { restaurantId, period: `${days}d`, callCount, orderCount };
  }

  async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const restaurantId = subscription.metadata?.restaurantId;
    if (!restaurantId) return;

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        plan: "PRO",
      },
    });

    this.logger.log(`Subscription created for restaurant ${restaurantId}: ${subscription.id}`);
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const restaurantId = subscription.metadata?.restaurantId;
    if (!restaurantId) return;

    const status = subscription.status;
    const plan = status === "active" ? "PRO" : "FREE";

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { plan },
    });

    this.logger.log(`Subscription updated for restaurant ${restaurantId}: status=${status}`);
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const restaurantId = subscription.metadata?.restaurantId;
    if (!restaurantId) return;

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        plan: "FREE",
        stripeSubscriptionId: null,
      },
    });

    this.logger.log(`Subscription cancelled for restaurant ${restaurantId}`);
  }
}
