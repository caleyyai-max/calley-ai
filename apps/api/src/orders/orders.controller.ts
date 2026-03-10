import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

const ORDER_STATUS = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

@ApiTags("Orders")
@Controller("api/restaurants/:restaurantId/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new order" })
  create(
    @Param("restaurantId") restaurantId: string,
    @Body() dto: CreateOrderDto
  ) {
    return this.ordersService.create(restaurantId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List orders for a restaurant" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "status", required: false })
  findAll(
    @Param("restaurantId") restaurantId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("status") status?: string
  ) {
    return this.ordersService.findByRestaurant(restaurantId, page, limit, status);
  }

  @Get("active")
  @ApiOperation({ summary: "Get active orders" })
  getActive(@Param("restaurantId") restaurantId: string) {
    return this.ordersService.findByRestaurant(restaurantId, 1, 50, ORDER_STATUS.NEW);
  }

  @Get(":orderId")
  @ApiOperation({ summary: "Get order details" })
  findOne(@Param("orderId") orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Put(":orderId/status")
  @ApiOperation({ summary: "Update order status" })
  updateStatus(
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto
  ) {
    return this.ordersService.updateStatus(orderId, dto);
  }
}
