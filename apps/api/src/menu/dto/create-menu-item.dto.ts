import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateModifierDto {
  @ApiProperty({ example: "Extra Cheese" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 1.50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: "Toppings" })
  @IsString()
  @IsOptional()
  group?: string;
}

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ example: "Margherita Pizza" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: "Classic tomato sauce, mozzarella, fresh basil" })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 14.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: "Pizza" })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ type: [CreateModifierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModifierDto)
  @IsOptional()
  modifiers?: CreateModifierDto[];
}
