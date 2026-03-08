import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCallDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vapiCallId: string;

  @ApiProperty({ example: "+12125551234" })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;
}
