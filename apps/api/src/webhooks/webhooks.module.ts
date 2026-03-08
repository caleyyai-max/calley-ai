import { Module } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { BillingModule } from "../billing/billing.module";
import { CallsModule } from "../calls/calls.module";
import { OrdersModule } from "../orders/orders.module";
import { VapiModule } from "../vapi/vapi.module";

@Module({
  imports: [BillingModule, CallsModule, OrdersModule, VapiModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
