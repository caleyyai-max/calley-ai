import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(restaurantId: string, dto: CreateMenuItemDto) {
    const maxPosition = await this.prisma.menuItem.aggregate({
      where: { restaurantId, category: dto.category },
      _max: { sortOrder: true },
    });

    const menuItem = await this.prisma.menuItem.create({
      data: {
        restaurantId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        isAvailable: dto.isAvailable ?? true,
        imageUrl: dto.imageUrl,
        modifiers: dto.modifiers ?? [],
        sortOrder: (maxPosition._max.sortOrder ?? 0) + 1,
      },
    });

    this.logger.log(
      `Menu item created: ${menuItem.id} "${menuItem.name}" for restaurant ${restaurantId}`
    );
    return menuItem;
  }

  async findByRestaurant(restaurantId: string, category?: string) {
    const where: any = { restaurantId };
    if (category) where.category = category;

    const items = await this.prisma.menuItem.findMany({
      where,
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    const grouped = items.reduce(
      (acc: Record<string, any[]>, item: { category: string }) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, any[]>
    );

    return { items, grouped };
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    await this.prisma.menuItem.delete({ where: { id } });
    return { deleted: true, id };
  }

  async updateAvailability(id: string, isAvailable: boolean) {
    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async getMenuForVapi(restaurantId: string): Promise<string> {
    const { grouped } = await this.findByRestaurant(restaurantId);

    let menuText = "";
    for (const [category, items] of Object.entries(grouped)) {
      menuText += `\n${category}:\n`;
      (items as any[]).forEach((item: { name: string; price: any; description?: string; modifiers?: any[] }) => {
        menuText += `  - ${item.name}: $${Number(item.price).toFixed(2)}`;
        if (item.description) menuText += ` - ${item.description}`;
        menuText += "\n";
        if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
          const mods = item.modifiers as { name: string; price: number }[];
          menuText += `    Modifiers: ${mods.map((m: { name: string; price: number }) => `${m.name} (+$${m.price.toFixed(2)})`).join(", ")}\n`;
        }
      });
    }

    return menuText.trim();
  }
}
