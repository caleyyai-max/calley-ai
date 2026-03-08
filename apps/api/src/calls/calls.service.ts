import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCallDto } from "./dto/create-call.dto";
import { UpdateCallDto } from "./dto/update-call.dto";
import { CallStatus } from "@prisma/client";

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCallDto) {
    const call = await this.prisma.call.create({
      data: {
        restaurantId: dto.restaurantId,
        vapiCallId: dto.vapiCallId,
        customerPhone: dto.customerPhone,
        status: CallStatus.RINGING,
        startedAt: new Date(),
      },
    });

    this.logger.log(
      `Call created: ${call.id} (Vapi: ${dto.vapiCallId}) for restaurant ${dto.restaurantId}`
    );
    return call;
  }

  async findByRestaurant(
    restaurantId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const [calls, total] = await Promise.all([
      this.prisma.call.findMany({
        where: { restaurantId },
        include: {
          order: {
            select: { id: true, status: true, totalAmount: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.call.count({ where: { restaurantId } }),
    ]);

    return {
      data: calls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const call = await this.prisma.call.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: { include: { menuItem: true } },
          },
        },
        restaurant: { select: { id: true, name: true } },
      },
    });

    if (!call) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    return call;
  }

  async findByVapiId(vapiCallId: string) {
    const call = await this.prisma.call.findUnique({
      where: { vapiCallId },
      include: { restaurant: true },
    });

    if (!call) {
      throw new NotFoundException(`Call with Vapi ID ${vapiCallId} not found`);
    }

    return call;
  }

  async update(id: string, dto: UpdateCallDto) {
    return this.prisma.call.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === CallStatus.COMPLETED && { endedAt: new Date() }),
      },
    });
  }

  async completeCall(
    vapiCallId: string,
    data: {
      duration: number;
      transcript: string;
      summary?: string;
      sentiment?: string;
    }
  ) {
    const call = await this.prisma.call.update({
      where: { vapiCallId },
      data: {
        status: CallStatus.COMPLETED,
        duration: data.duration,
        transcript: data.transcript,
        summary: data.summary,
        sentiment: data.sentiment,
        endedAt: new Date(),
      },
    });

    // Increment subscription call usage
    await this.prisma.subscription.updateMany({
      where: {
        restaurantId: call.restaurantId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      data: {
        callsUsed: { increment: 1 },
      },
    });

    this.logger.log(`Call completed: ${call.id} (duration: ${data.duration}s)`);
    return call;
  }

  async getCallStats(restaurantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalCalls, completedCalls, avgDuration] = await Promise.all([
      this.prisma.call.count({
        where: {
          restaurantId,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.call.count({
        where: {
          restaurantId,
          status: CallStatus.COMPLETED,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.call.aggregate({
        where: {
          restaurantId,
          status: CallStatus.COMPLETED,
          createdAt: { gte: startDate },
        },
        _avg: { duration: true },
      }),
    ]);

    return {
      totalCalls,
      completedCalls,
      failedCalls: totalCalls - completedCalls,
      successRate:
        totalCalls > 0
          ? Math.round((completedCalls / totalCalls) * 100)
          : 0,
      avgDuration: Math.round(avgDuration._avg.duration || 0),
    };
  }
}
