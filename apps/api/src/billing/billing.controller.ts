import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BillingService } from "./billing.service";

@ApiTags("billing")
@ApiBearerAuth()
@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post("checkout/:restaurantId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Create Stripe checkout session" })
  async createCheckoutSession(
    @Param("restaurantId") restaurantId: string,
    @Body() body: { priceId: string; successUrl: string; cancelUrl: string }
  ) {
    return this.billingService.createCheckoutSession(
      restaurantId,
      body.priceId,
      body.successUrl,
      body.cancelUrl
    );
  }

  @Post("portal/:restaurantId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Create Stripe customer portal session" })
  async createPortalSession(
    @Param("restaurantId") restaurantId: string,
    @Body() body: { returnUrl: string }
  ) {
    return this.billingService.createPortalSession(restaurantId, body.returnUrl);
  }

  @Get("subscription/:restaurantId")
  @ApiOperation({ summary: "Get subscription status for a restaurant" })
  async getSubscription(@Param("restaurantId") restaurantId: string) {
    return this.billingService.getSubscription(restaurantId);
  }

  @Get("usage/:restaurantId")
  @ApiOperation({ summary: "Get usage metrics for billing" })
  async getUsage(
    @Param("restaurantId") restaurantId: string,
    @Query("days") days?: number
  ) {
    return this.billingService.getUsage(restaurantId, days || 30);
  }
}
