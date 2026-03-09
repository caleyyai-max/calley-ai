import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@ApiBearerAuth()
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard/:restaurantId")
  @ApiOperation({ summary: "Get dashboard analytics overview" })
  async getDashboard(
    @Param("restaurantId") restaurantId: string,
    @Query("days") days?: number
  ) {
    return this.analyticsService.getDashboardStats(restaurantId, days || 30);
  }

  @Get("calls/:restaurantId")
  @ApiOperation({ summary: "Get call analytics" })
  async getCallAnalytics(
    @Param("restaurantId") restaurantId: string,
    @Query("days") days?: number
  ) {
    return this.analyticsService.getCallAnalytics(restaurantId, days || 30);
  }

  @Get("revenue/:restaurantId")
  @ApiOperation({ summary: "Get revenue analytics" })
  async getRevenueAnalytics(
    @Param("restaurantId") restaurantId: string,
    @Query("days") days?: number
  ) {
    return this.analyticsService.getRevenueAnalytics(restaurantId, days || 30);
  }

  @Get("popular-items/:restaurantId")
  @ApiOperation({ summary: "Get most popular menu items" })
  async getPopularItems(
    @Param("restaurantId") restaurantId: string,
    @Query("limit") limit?: number
  ) {
    return this.analyticsService.getPopularItems(restaurantId, limit || 10);
  }
}
