import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createItem(dto: CreateMenuItemDto) {
    const item = await this.prisma.menuItem.create({
      data: {
        restaurantId: dto.restaurantId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        sortOrder: dto.sortOrder ?? 0,
        modifiers: dto.modifiers
          ? {
              create: dto.modifiers.map((mod) => ({
                name: mod.name,
                price: mod.price ?? 0,
                isDefault: mod.isDefault ?? false,
                group: mod.group,
              })),
            }
          : undefined,
      },
      include: { modifiers: true },
    });

    this.logger.log(`Menu item created: ${item.id} (${item.name})`);
    return item;
  }

  async findByRestaurant(restaurantId: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: { modifiers: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    // Group by category
    const categories: Record<string, typeof items> = {};
    for (const item of items) {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    }

    return {
      items,
      categories: Object.entries(categories).map(([name, items]) => ({
        name,
        items,
        count: items.length,
      })),
      totalItems: items.length,
    };
  }

  async findById(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { modifiers: true, restaurant: { select: { id: true, name: true } } },
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findById(id);

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable,
        sortOrder: dto.sortOrder,
      },
      include: { modifiers: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.menuItem.delete({ where: { id } });
    this.logger.log(`Menu item deleted: ${id}`);
    return { deleted: true };
  }

  async toggleAvailability(id: string) {
    const item = await this.findById(id);

    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
    });
  }

  async reorder(restaurantId: string, itemOrders: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      itemOrders.map((item) =>
        this.prisma.menuItem.update({
          where: { id: item.id, restaurantId },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return { updated: itemOrders.length };
  }

  /**
   * Get menu formatted for the AI voice agent.
   * Returns a simplified structure optimized for Vapi.ai context.
   */
  async getMenuForAI(restaurantId: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      include: { modifiers: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    return items.map((item) => ({
      name: item.name,
      description: item.description,
      price: `$${Number(item.price).toFixed(2)}`,
      category: item.category,
      modifiers: item.modifiers.map((m) => ({
        name: m.name,
        price: Number(m.price) > 0 ? `+$${Number(m.price).toFixed(2)}` : "included",
        group: m.group,
      })),
    }));
  }
}
