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
  const appUrl = configService.get<string>(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000"
  );

  // Security middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS configuration
  app.enableCors({
    origin: [appUrl, "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global API prefix
  app.setGlobalPrefix("api", {
    exclude: ["health", "webhooks/stripe", "webhooks/vapi"],
  });

  // Socket.io adapter for WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger API documentation (development only)
  if (configService.get("NODE_ENV") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Calley AI API")
      .setDescription(
        "API documentation for Calley AI - AI Phone Ordering for Restaurants"
      )
      .setVersion("1.0")
      .addBearerAuth()
      .addTag("restaurants", "Restaurant management")
      .addTag("menu", "Menu management")
      .addTag("orders", "Order processing")
      .addTag("calls", "AI call handling")
      .addTag("analytics", "Dashboard analytics")
      .addTag("billing", "Stripe billing")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`Swagger docs available at http://localhost:${port}/docs`);
  }

  await app.listen(port);
  logger.log(`Calley AI API running on http://localhost:${port}`);
  logger.log(`Environment: ${configService.get("NODE_ENV", "development")}`);
}

bootstrap();
