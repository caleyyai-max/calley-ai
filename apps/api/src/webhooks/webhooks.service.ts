import {
  Injectable,
  Logger,
  BadRequestException,
  RawBodyRequest,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BillingService } from "../billing/billing.service";
import { CallsService } from "../calls/calls.service";
import { VapiFunctionHandler } from "../vapi/vapi-function-handler";
import Stripe from "stripe";
import type { Request } from "express";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly billingService: BillingService,
    private readonly callsService: CallsService,
    private readonly functionHandler: VapiFunctionHandler,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow("STRIPE_SECRET_KEY"), {
      apiVersion: "2023-10-16",
    });
  }

  // ---- Stripe Webhooks ----

  async handleStripeWebhook(req: RawBodyRequest<Request>) {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = this.config.getOrThrow("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      this.logger.error(`Stripe webhook signature verification failed: ${err.message}`);
      throw new BadRequestException("Invalid webhook signature");
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case "customer.subscription.created":
        await this.billingService.handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await this.billingService.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await this.billingService.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        this.logger.log(
          `Payment succeeded for invoice: ${(event.data.object as Stripe.Invoice).id}`
        );
        break;

      case "invoice.payment_failed":
        this.logger.warn(
          `Payment failed for invoice: ${(event.data.object as Stripe.Invoice).id}`
        );
        break;

      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  // ---- Vapi.ai Webhooks ----

  async handleVapiWebhook(body: any) {
    const { message } = body;

    if (!message) {
      this.logger.warn("Vapi webhook received with no message");
      return { received: true };
    }

    this.logger.log(`Vapi webhook received: ${message.type}`);

    switch (message.type) {
      case "status-update": {
        const { status, call } = message;

        if (status === "in-progress" && call?.id) {
          // Call started - create record if not exists
          try {
            await this.callsService.findByVapiId(call.id);
          } catch {
            // Create new call record if we can resolve the restaurant
            if (call.customer?.number && call.assistantId) {
              this.logger.log(`New call started: ${call.id} from ${call.customer.number}`);
            }
          }
        }
        break;
      }

      case "end-of-call-report": {
        const { call, summary, transcript } = message;

        if (call?.id) {
          // Clean up the in-memory cart
          this.functionHandler.cleanupCart(call.id);

          try {
            const duration = call.endedAt && call.startedAt
              ? Math.round(
                  (new Date(call.endedAt).getTime() -
                    new Date(call.startedAt).getTime()) /
                    1000
                )
              : 0;

            await this.callsService.completeCall(call.id, {
              duration,
              transcript: typeof transcript === "string"
                ? transcript
                : JSON.stringify(transcript),
              summary: summary || undefined,
            });

            this.logger.log(
              `Call completed via webhook: ${call.id} (${duration}s)`
            );
          } catch (error: any) {
            this.logger.error(
              `Failed to process end-of-call for ${call.id}: ${error.message}`
            );
          }
        }
        break;
      }

      case "function-call": {
        // Function calls are now handled by VapiController at /vapi/webhook/function
        // This is a fallback for the legacy /webhooks/vapi endpoint
        const { functionCall, call } = message;

        this.logger.log(
          `Vapi function call (legacy endpoint): ${functionCall?.name}`
        );

        if (functionCall?.name && call?.id) {
          // For legacy support, return a message directing to the new endpoint
          return {
            result: "Function processed. Please update your Vapi assistant to use the new webhook URL.",
          };
        }

        return { result: "Function call received" };
      }

      case "hang": {
        const { call } = message;
        if (call?.id) {
          this.functionHandler.cleanupCart(call.id);
        }
        this.logger.log("Vapi call hang notification received");
        break;
      }

      default:
        this.logger.log(`Unhandled Vapi message type: ${message.type}`);
    }

    return { received: true };
  }
}
