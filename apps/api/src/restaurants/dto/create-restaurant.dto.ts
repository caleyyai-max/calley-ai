import { IsString, IsOptional, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRestaurantDto {
  @ApiProperty({ example: "Mario's Pizza" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: "123 Main St, New York, NY 10001" })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: "+12125551234" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: "America/New_York" })
  @IsString()
  @IsOptional()
  timezone?: string;
}
