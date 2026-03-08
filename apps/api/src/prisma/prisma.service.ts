import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, "query" | "error" | "warn">
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
      ],
      errorFormat: "pretty",
    });
  }

  async onModuleInit(): Promise<void> {
    // Log slow queries in development
    if (process.env.NODE_ENV !== "production") {
      this.$on("query", (event: Prisma.QueryEvent) => {
        if (event.duration > 100) {
          this.logger.warn(
            `Slow query (${event.duration}ms): ${event.query}`
          );
        }
      });
    }

    this.$on("error", (event: Prisma.LogEvent) => {
      this.logger.error(`Database error: ${event.message}`);
    });

    this.$on("warn", (event: Prisma.LogEvent) => {
      this.logger.warn(`Database warning: ${event.message}`);
    });

    try {
      await this.$connect();
      this.logger.log("Database connection established");
    } catch (error) {
      this.logger.error("Failed to connect to database", error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log("Database connection closed");
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("cleanDatabase is only available in test environment");
    }

    const deleteOrder = [
      "orderItemModifier",
      "orderItem",
      "order",
      "menuModifier",
      "menuItem",
      "call",
      "subscription",
      "restaurant",
    ];

    for (const modelName of deleteOrder) {
      const model = (this as any)[modelName];
      if (model?.deleteMany) {
        await model.deleteMany();
      }
    }
  }

  async executeInTransaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): Promise<T> {
    return this.$transaction(fn, {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? 10000,
      isolationLevel: options?.isolationLevel,
    });
  }
}
