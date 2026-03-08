import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto, clerkOrgId: string) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const restaurant = await this.prisma.restaurant.create({
      data: {
        ...dto,
        slug,
        clerkOrgId,
      },
    });

    this.logger.log(`Restaurant created: ${restaurant.id} (${restaurant.name})`);
    return restaurant;
  }

  async findByClerkOrg(clerkOrgId: string) {
    return this.prisma.restaurant.findUnique({
      where: { clerkOrgId },
      include: {
        _count: {
          select: {
            menuItems: true,
            orders: true,
            calls: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: "asc" },
          include: { modifiers: true },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async findBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant "${slug}" not found`);
    }

    return restaurant;
  }

  async update(id: string, dto: UpdateRestaurantDto) {
    await this.findById(id);

    return this.prisma.restaurant.update({
      where: { id },
      data: dto,
    });
  }

  async updateVapiAssistant(id: string, vapiAssistantId: string) {
    return this.prisma.restaurant.update({
      where: { id },
      data: { vapiAssistantId },
    });
  }

  async updateTwilioPhone(id: string, twilioPhoneNumber: string) {
    return this.prisma.restaurant.update({
      where: { id },
      data: { twilioPhoneNumber },
    });
  }

  async deactivate(id: string) {
    return this.prisma.restaurant.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
