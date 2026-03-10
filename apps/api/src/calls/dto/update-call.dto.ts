import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from "class-validator";

// Use string enum to avoid Prisma client path issues
enum CallStatusEnum {
  RINGING = "RINGING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  MISSED = "MISSED",
}

export class UpdateCallDto {
  @IsEnum(CallStatusEnum)
  @IsOptional()
  status?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  transcript?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  sentiment?: string;
}
