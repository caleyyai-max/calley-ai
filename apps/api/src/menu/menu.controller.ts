import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MenuService } from "./menu.service";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

@ApiTags("menu")
@ApiBearerAuth()
@Controller("menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a menu item" })
  async createItem(@Body() dto: CreateMenuItemDto) {
    return this.menuService.createItem(dto);
  }

  @Get("restaurant/:restaurantId")
  @ApiOperation({ summary: "Get full menu for a restaurant" })
  async findByRestaurant(@Param("restaurantId") restaurantId: string) {
    return this.menuService.findByRestaurant(restaurantId);
  }

  @Get("restaurant/:restaurantId/ai")
  @ApiOperation({ summary: "Get AI-formatted menu for voice agent" })
  async getMenuForAI(@Param("restaurantId") restaurantId: string) {
    return this.menuService.getMenuForAI(restaurantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get menu item by ID" })
  async findById(@Param("id") id: string) {
    return this.menuService.findById(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update menu item" })
  async update(@Param("id") id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.update(id, dto);
  }

  @Patch(":id/toggle")
  @ApiOperation({ summary: "Toggle menu item availability" })
  async toggleAvailability(@Param("id") id: string) {
    return this.menuService.toggleAvailability(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete menu item" })
  async delete(@Param("id") id: string) {
    return this.menuService.delete(id);
  }
}
