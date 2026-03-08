import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { RestaurantsModule } from "./restaurants/restaurants.module";
import { MenuModule } from "./menu/menu.module";
import { OrdersModule } from "./orders/orders.module";
import { CallsModule } from "./calls/calls.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { BillingModule } from "./billing/billing.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { VapiModule } from "./vapi/vapi.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: "../../.env" }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }, { ttl: 10000, limit: 20 }, { ttl: 1000, limit: 5 }]),
    PrismaModule,
    RestaurantsModule,
    MenuModule,
    OrdersModule,
    CallsModule,
    AnalyticsModule,
    BillingModule,
    WebhooksModule,
    VapiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
