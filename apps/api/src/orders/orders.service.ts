import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(restaurantId: string, dto: CreateOrderDto) {
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.items.map((i: { menuItemId: string }) => i.menuItemId) },
        restaurantId,
      },
    });

    const menuMap = new Map(
      menuItems.map((m: { id: string; price: any; name: string }) => [m.id, m])
    );

    const totalAmount = dto.items.reduce(
      (sum: number, item: { menuItemId: string; quantity: number }) => {
        const menuItem = menuMap.get(item.menuItemId);
        return sum + (menuItem ? Number(menuItem.price) * item.quantity : 0);
      },
      0
    );

    const order = await this.prisma.order.create({
      data: {
        restaurantId,
        customerPhone: dto.customerPhone,
        customerName: dto.customerName,
        totalAmount,
        specialInstructions: dto.specialInstructions,
        items: {
          create: dto.items.map((item: { menuItemId: string; quantity: number; modifiers?: string[]; specialInstructions?: string }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: Number(menuMap.get(item.menuItemId)?.price ?? 0),
            modifiers: item.modifiers ?? [],
            specialInstructions: item.specialInstructions,
          })),
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    this.logger.log(`Order created: ${order.id} for restaurant ${restaurantId}`);
    return order;
  }

  async findByRestaurant(
    restaurantId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ) {
    const where: any = { restaurantId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: true } },
          call: { select: { id: true, vapiCallId: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        call: true,
        restaurant: { select: { id: true, name: true } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { menuItem: true } } },
    });
  }
}
