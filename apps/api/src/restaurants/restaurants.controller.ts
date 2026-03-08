import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { RestaurantsService } from "./restaurants.service";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@ApiTags("restaurants")
@ApiBearerAuth()
@Controller("restaurants")
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new restaurant" })
  async create(
    @Body() dto: CreateRestaurantDto,
    @Headers("x-clerk-org-id") clerkOrgId: string
  ) {
    return this.restaurantsService.create(dto, clerkOrgId);
  }

  @Get("me")
  @ApiOperation({ summary: "Get current user restaurant" })
  async findMine(@Headers("x-clerk-org-id") clerkOrgId: string) {
    return this.restaurantsService.findByClerkOrg(clerkOrgId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get restaurant by ID" })
  async findById(@Param("id") id: string) {
    return this.restaurantsService.findById(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update restaurant" })
  async update(@Param("id") id: string, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantsService.update(id, dto);
  }
}
