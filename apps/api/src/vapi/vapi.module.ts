import { Module } from '@nestjs/common';
import { VapiService } from './vapi.service';
import { VapiFunctionHandler } from './vapi-function-handler';
import { VapiController } from './vapi.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MenuModule } from '../menu/menu.module';
import { OrdersModule } from '../orders/orders.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [PrismaModule, MenuModule, OrdersModule, RestaurantsModule],
  controllers: [VapiController],
  providers: [VapiService, VapiFunctionHandler],
  exports: [VapiService, VapiFunctionHandler],
})
export class VapiModule {}
