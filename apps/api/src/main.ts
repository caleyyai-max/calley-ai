import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3001);
  const appUrl = configService.get<string>("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  app.enableCors({
    origin: [appUrl, "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));

  app.setGlobalPrefix("api", { exclude: ["health", "webhooks/stripe", "webhooks/vapi"] });
  app.useWebSocketAdapter(new IoAdapter(app));

  if (configService.get("NODE_ENV") !== "production") {
    const swaggerConfig = new DocumentBuilder().setTitle("Calley AI API").setDescription("API documentation for Calley AI").setVersion("1.0").addBearerAuth().build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document);
    logger.log(`Swagger docs at http://localhost:${port}/docs`);
  }

  await app.listen(port);
  logger.log(`Calley AI API running on http://localhost:${port}`);
}

bootstrap();
