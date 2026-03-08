import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CallStatus } from "@prisma/client";

export class UpdateCallDto {
  @ApiPropertyOptional({ enum: CallStatus })
  @IsEnum(CallStatus)
  @IsOptional()
  status?: CallStatus;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  transcript?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sentiment?: string;
}
