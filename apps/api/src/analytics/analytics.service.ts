import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CallStatus, OrderStatus } from "@prisma/client";

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(restaurantId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalCalls, completedCalls, totalOrders, completedOrders, revenue] =
      await Promise.all([
        this.prisma.call.count({
          where: { restaurantId, createdAt: { gte: since } },
        }),
        this.prisma.call.count({
          where: {
            restaurantId,
            status: CallStatus.COMPLETED,
            createdAt: { gte: since },
          },
        }),
        this.prisma.order.count({
          where: { restaurantId, createdAt: { gte: since } },
        }),
        this.prisma.order.count({
          where: {
            restaurantId,
            status: OrderStatus.COMPLETED,
            createdAt: { gte: since },
          },
        }),
        this.prisma.order.aggregate({
          where: {
            restaurantId,
            status: OrderStatus.COMPLETED,
            createdAt: { gte: since },
          },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      period: `${days}d`,
      calls: {
        total: totalCalls,
        completed: completedCalls,
        successRate: totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        conversionRate: totalCalls > 0 ? (totalOrders / totalCalls) * 100 : 0,
      },
      revenue: {
        total: revenue._sum.totalAmount || 0,
        averageOrderValue:
          completedOrders > 0
            ? (revenue._sum.totalAmount || 0) / completedOrders
            : 0,
      },
    };
  }

  async getCallAnalytics(restaurantId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const calls = await this.prisma.call.groupBy({
      by: ["status"],
      where: { restaurantId, createdAt: { gte: since } },
      _count: true,
    });

    const avgDuration = await this.prisma.call.aggregate({
      where: {
        restaurantId,
        status: CallStatus.COMPLETED,
        createdAt: { gte: since },
      },
      _avg: { duration: true },
    });

    return {
      period: `${days}d`,
      byStatus: calls.map((c) => ({ status: c.status, count: c._count })),
      averageDuration: avgDuration._avg.duration || 0,
    };
  }

  async getRevenueAnalytics(restaurantId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        status: OrderStatus.COMPLETED,
        createdAt: { gte: since },
      },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return {
      period: `${days}d`,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      orderCount: orders.length,
      orders: orders.map((o) => ({
        amount: o.totalAmount,
        date: o.createdAt,
      })),
    };
  }

  async getPopularItems(restaurantId: string, limit: number) {
    const items = await this.prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: { order: { restaurantId } },
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) } },
      select: { id: true, name: true, price: true },
    });

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    return items.map((item) => ({
      menuItem: menuMap.get(item.menuItemId),
      totalOrdered: item._sum.quantity,
      orderCount: item._count,
    }));
  }
}
