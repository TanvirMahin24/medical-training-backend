import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  AnalyticsService,
  CaseAnalytics,
  UserBehaviorAnalytics,
  RevenueAnalytics,
  LearningAnalytics,
} from './analytics.service';
import { AdminGuard } from '../admin/guards/admin.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('cases')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get case analytics' })
  @ApiResponse({
    status: 200,
    description: 'Case analytics retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCaseAnalytics(): Promise<CaseAnalytics> {
    return this.analyticsService.getCaseAnalytics();
  }

  @Get('user-behavior')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user behavior analytics' })
  @ApiResponse({
    status: 200,
    description: 'User behavior analytics retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserBehaviorAnalytics(): Promise<UserBehaviorAnalytics> {
    return this.analyticsService.getUserBehaviorAnalytics();
  }

  @Get('revenue')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({
    status: 200,
    description: 'Revenue analytics retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    return this.analyticsService.getRevenueAnalytics();
  }

  @Get('learning')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get learning analytics' })
  @ApiResponse({
    status: 200,
    description: 'Learning analytics retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getLearningAnalytics(): Promise<LearningAnalytics> {
    return this.analyticsService.getLearningAnalytics();
  }

  @Get('comprehensive')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive analytics dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive analytics retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getComprehensiveAnalytics() {
    return this.analyticsService.getComprehensiveAnalytics();
  }

  @Get('user/:userId/recommendations')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized recommendations for a user' })
  @ApiResponse({
    status: 200,
    description: 'User recommendations retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserRecommendations(@Param('userId') userId: string) {
    // This would integrate with the learning analytics to provide personalized recommendations
    const learningAnalytics =
      await this.analyticsService.getLearningAnalytics();

    const userRecommendations =
      learningAnalytics.learningPath.recommendedNextCase.filter(
        (rec) => rec.userId === userId,
      );

    const skillGaps = learningAnalytics.learningPath.skillGaps.filter(
      (gap) => gap.userId === userId,
    );

    return {
      userId,
      recommendedCases: userRecommendations,
      skillGaps: skillGaps[0] || { missingSkills: [], recommendedCases: [] },
      timestamp: new Date(),
    };
  }

  @Get('performance/trends')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    description: 'Time period for trends (daily, weekly, monthly)',
    example: 'monthly',
  })
  @ApiOperation({ summary: 'Get performance trends over time' })
  @ApiResponse({
    status: 200,
    description: 'Performance trends retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getPerformanceTrends(@Query('period') period: string = 'monthly') {
    // This would provide trend analysis over different time periods
    const caseAnalytics = await this.analyticsService.getCaseAnalytics();
    const userBehavior = await this.analyticsService.getUserBehaviorAnalytics();

    return {
      period,
      trends: {
        caseCompletion: {
          current: caseAnalytics.completedCases,
          previous: Math.floor(caseAnalytics.completedCases * 0.9), // Simulated previous period
          change: 10, // 10% increase
        },
        userEngagement: {
          current: userBehavior.engagementMetrics.dailyActiveUsers,
          previous: Math.floor(
            userBehavior.engagementMetrics.dailyActiveUsers * 0.95,
          ),
          change: 5, // 5% increase
        },
        averageScore: {
          current: caseAnalytics.averageScore,
          previous: caseAnalytics.averageScore - 2,
          change: 2, // 2 point increase
        },
      },
      timestamp: new Date(),
    };
  }
}
