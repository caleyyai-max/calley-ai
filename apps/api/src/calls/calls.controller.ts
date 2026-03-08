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
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CallsService } from "./calls.service";
import { CreateCallDto } from "./dto/create-call.dto";
import { UpdateCallDto } from "./dto/update-call.dto";

@ApiTags("calls")
@ApiBearerAuth()
@Controller("calls")
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new call record" })
  async create(@Body() dto: CreateCallDto) {
    return this.callsService.create(dto);
  }

  @Get("restaurant/:restaurantId")
  @ApiOperation({ summary: "Get calls by restaurant" })
  async findByRestaurant(
    @Param("restaurantId") restaurantId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.callsService.findByRestaurant(restaurantId, page, limit);
  }

  @Get("restaurant/:restaurantId/stats")
  @ApiOperation({ summary: "Get call statistics" })
  async getStats(
    @Param("restaurantId") restaurantId: string,
    @Query("days") days?: number
  ) {
    return this.callsService.getCallStats(restaurantId, days || 30);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get call by ID" })
  async findById(@Param("id") id: string) {
    return this.callsService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update call" })
  async update(@Param("id") id: string, @Body() dto: UpdateCallDto) {
    return this.callsService.update(id, dto);
  }
}
