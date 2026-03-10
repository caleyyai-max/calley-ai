import { Controller, Post, Body, Req, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from "@nestjs/swagger";
import { WebhooksService } from "./webhooks.service";
import { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";

@ApiTags("webhooks")
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("stripe")
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>) {
    return this.webhooksService.handleStripeWebhook(req);
  }

  @Post("vapi")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Handle Vapi.ai webhook events" })
  async handleVapiWebhook(@Body() body: any) {
    return this.webhooksService.handleVapiWebhook(body);
  }
}
