import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const order = await this.prisma.executeInTransaction(async (tx) => {
      // Calculate total from items
      let totalAmount = 0;

      const orderItems = await Promise.all(
        dto.items.map(async (item) => {
          const menuItem = await tx.menuItem.findUniqueOrThrow({
            where: { id: item.menuItemId },
            include: { modifiers: true },
          });

          const itemTotal = Number(menuItem.price) * item.quantity;
          let modifierTotal = 0;

          const modifiers = item.modifierIds
            ? menuItem.modifiers.filter((m) =>
                item.modifierIds!.includes(m.id)
              )
            : [];

          modifierTotal = modifiers.reduce(
            (sum, m) => sum + Number(m.price) * item.quantity,
            0
          );

          totalAmount += itemTotal + modifierTotal;

          return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: menuItem.price,
            notes: item.notes,
            modifiers: modifiers.map((m) => ({
              menuModifierId: m.id,
              price: m.price,
            })),
          };
        })
      );

      const taxAmount = totalAmount * 0.08875; // NYC tax rate as default
      const finalTotal = totalAmount + taxAmount;

      const newOrder = await tx.order.create({
        data: {
          restaurantId: dto.restaurantId,
          customerPhone: dto.customerPhone,
          totalAmount: finalTotal,
          subtotalAmount: totalAmount,
          taxAmount: taxAmount,
          notes: dto.notes,
          callId: dto.callId,
          items: {
            create: orderItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: item.notes,
              modifiers: {
                create: item.modifiers,
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
              modifiers: {
                include: { menuModifier: true },
              },
            },
          },
        },
      });

      return newOrder;
    });

    this.logger.log(
      `Order created: ${order.id} for restaurant ${dto.restaurantId}`
    );
    return order;
  }

  async findByRestaurant(
    restaurantId: string,
    status?: OrderStatus,
    page: number = 1,
    limit: number = 20
  ) {
    const where = {
      restaurantId,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: true,
              modifiers: { include: { menuModifier: true } },
            },
          },
          call: { select: { id: true, duration: true, summary: true } },
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

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
            modifiers: { include: { menuModifier: true } },
          },
        },
        call: true,
        restaurant: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findById(id);

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.estimatedPickupTime && { estimatedPickupTime: dto.estimatedPickupTime }),
      },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    this.logger.log(`Order ${id} status updated to ${dto.status}`);
    return order;
  }

  async getActiveOrders(restaurantId: string) {
    return this.prisma.order.findMany({
      where: {
        restaurantId,
        status: {
          in: [
            OrderStatus.NEW,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
          ],
        },
      },
      include: {
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }
}
