import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderStatus } from "@prisma/client";

@ApiTags("orders")
@ApiBearerAuth()
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new order" })
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get("restaurant/:restaurantId")
  @ApiOperation({ summary: "Get orders by restaurant" })
  @ApiQuery({ name: "status", required: false, enum: OrderStatus })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findByRestaurant(
    @Param("restaurantId") restaurantId: string,
    @Query("status") status?: OrderStatus,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.ordersService.findByRestaurant(
      restaurantId,
      status,
      page || 1,
      limit || 20
    );
  }

  @Get("restaurant/:restaurantId/active")
  @ApiOperation({ summary: "Get active orders for restaurant" })
  async getActiveOrders(@Param("restaurantId") restaurantId: string) {
    return this.ordersService.getActiveOrders(restaurantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order by ID" })
  async findById(@Param("id") id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update order status" })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
