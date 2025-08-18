import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  MonitoringService,
  PerformanceMetrics,
  UserAnalytics,
  SystemHealth,
} from './monitoring.service';
import { AdminGuard } from '../admin/guards/admin.guard';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('metrics')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.monitoringService.collectPerformanceMetrics();
  }

  @Get('analytics')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserAnalytics(): Promise<UserAnalytics> {
    return this.monitoringService.getUserAnalytics();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health status retrieved successfully',
    type: Object,
  })
  async getSystemHealth(): Promise<SystemHealth> {
    return this.monitoringService.getSystemHealth();
  }

  @Get('history')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance history' })
  @ApiQuery({
    name: 'hours',
    required: false,
    type: Number,
    description: 'Number of hours to look back (default: 24)',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance history retrieved successfully',
    type: [Object],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getPerformanceHistory(
    @Query('hours') hours: string = '24',
  ): Promise<PerformanceMetrics[]> {
    return this.monitoringService.getPerformanceHistory(parseInt(hours));
  }

  @Get('dashboard')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive monitoring dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getDashboardData() {
    const [metrics, analytics, health] = await Promise.all([
      this.monitoringService.collectPerformanceMetrics(),
      this.monitoringService.getUserAnalytics(),
      this.monitoringService.getSystemHealth(),
    ]);

    return {
      metrics,
      analytics,
      health,
      timestamp: new Date(),
    };
  }
}
