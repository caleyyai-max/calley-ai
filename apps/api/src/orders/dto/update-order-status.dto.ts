import { IsEnum, IsOptional, IsString } from "class-validator";

enum OrderStatusEnum {
  NEW = "NEW",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusEnum)
  status!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
