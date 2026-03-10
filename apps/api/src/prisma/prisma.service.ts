import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
      ],
    });
  }

  async onModuleInit() {
    // Set up logging
    (this as any).$on("query", (e: any) => {
      if (process.env.NODE_ENV === "development") {
        this.logger.debug(`Query: ${e.query} — Duration: ${e.duration}ms`);
      }
    });

    (this as any).$on("error", (e: any) => {
      this.logger.error(`Prisma error: ${e.message}`);
    });

    (this as any).$on("info", (e: any) => {
      this.logger.log(`Prisma info: ${e.message}`);
    });

    (this as any).$on("warn", (e: any) => {
      this.logger.warn(`Prisma warning: ${e.message}`);
    });

    await this.$connect();
    this.logger.log("Database connection established");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Database connection closed");
  }

  /**
   * Execute operations in a transaction with serializable isolation.
   */
  async executeInTransaction<T>(
    fn: (prisma: PrismaService) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      return fn(prisma as unknown as PrismaService);
    }, {
      isolationLevel: "Serializable" as any,
    });
  }

  /**
   * Health check for the database connection.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
