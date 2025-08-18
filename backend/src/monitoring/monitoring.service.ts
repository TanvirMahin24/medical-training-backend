import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  databaseConnections: number;
  activeUsers: number;
  timestamp: Date;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userEngagement: number;
  topPerformingUsers: Array<{
    userId: string;
    email: string;
    score: number;
    casesCompleted: number;
  }>;
  userRetention: number;
}

export interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  redis: 'healthy' | 'warning' | 'critical';
  externalServices: 'healthy' | 'warning' | 'critical';
  overall: 'healthy' | 'warning' | 'critical';
  lastCheck: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly metricsCacheKey = 'performance_metrics';
  private readonly analyticsCacheKey = 'user_analytics';

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const startTime = Date.now();

      // Collect system metrics
      const [cpuUsage, memoryUsage] = await this.getSystemMetrics();
      const databaseConnections = await this.getDatabaseConnections();
      const activeUsers = await this.getActiveUsers();

      // Calculate response time (simulated for now)
      const responseTime = Date.now() - startTime;

      // Calculate throughput (requests per second)
      const throughput = await this.calculateThroughput();

      // Calculate error rate
      const errorRate = await this.calculateErrorRate();

      const metrics: PerformanceMetrics = {
        responseTime,
        throughput,
        errorRate,
        cpuUsage,
        memoryUsage,
        databaseConnections,
        activeUsers,
        timestamp: new Date(),
      };

      // Cache metrics for 5 minutes
      await this.cacheManager.set(this.metricsCacheKey, metrics, 300000);

      return metrics;
    } catch (error) {
      this.logger.error('Failed to collect performance metrics:', error);
      throw error;
    }
  }

  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      // Check cache first
      const cached = await this.cacheManager.get<UserAnalytics>(
        this.analyticsCacheKey,
      );
      if (cached) {
        return cached;
      }

      const [
        totalUsers,
        activeUsers,
        newUsers,
        topPerformingUsers,
        userRetention,
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getNewUsers(),
        this.getTopPerformingUsers(),
        this.calculateUserRetention(),
      ]);

      const userEngagement = await this.calculateUserEngagement();

      const analytics: UserAnalytics = {
        totalUsers,
        activeUsers,
        newUsers,
        userEngagement,
        topPerformingUsers,
        userRetention,
      };

      // Cache analytics for 10 minutes
      await this.cacheManager.set(this.analyticsCacheKey, analytics, 600000);

      return analytics;
    } catch (error) {
      this.logger.error('Failed to collect user analytics:', error);
      throw error;
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const [database, redis, externalServices] = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.checkExternalServicesHealth(),
      ]);

      const overall = this.calculateOverallHealth(
        database,
        redis,
        externalServices,
      );

      return {
        database,
        redis,
        externalServices,
        overall,
        lastCheck: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to check system health:', error);
      throw error;
    }
  }

  async getPerformanceHistory(
    hours: number = 24,
  ): Promise<PerformanceMetrics[]> {
    try {
      // In a real implementation, this would query a time-series database
      // For now, we'll return cached metrics
      const metrics = await this.cacheManager.get<PerformanceMetrics>(
        this.metricsCacheKey,
      );
      return metrics ? [metrics] : [];
    } catch (error) {
      this.logger.error('Failed to get performance history:', error);
      return [];
    }
  }

  private async getSystemMetrics(): Promise<[number, number]> {
    // In a real implementation, this would use system monitoring libraries
    // For now, return simulated values
    return [Math.random() * 100, Math.random() * 100];
  }

  private async getDatabaseConnections(): Promise<number> {
    try {
      // Get active database connections
      const result = await this.prisma.$queryRaw<
        Array<{ connections: string }>
      >`
        SELECT count(*) as connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
      return Number(result[0]?.connections || 0);
    } catch (error) {
      this.logger.warn('Failed to get database connections:', error);
      return 0;
    }
  }

  private async getActiveUsers(): Promise<number> {
    try {
      // Count users active in the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return await this.prisma.user.count({
        where: {
          updatedAt: {
            gte: yesterday,
          },
        },
      });
    } catch (error) {
      this.logger.warn('Failed to get active users:', error);
      return 0;
    }
  }

  private async calculateThroughput(): Promise<number> {
    // In a real implementation, this would track actual requests
    // For now, return a simulated value
    return Math.random() * 1000 + 100;
  }

  private async calculateErrorRate(): Promise<number> {
    // In a real implementation, this would track actual errors
    // For now, return a simulated value
    return Math.random() * 5;
  }

  private async getTotalUsers(): Promise<number> {
    return await this.prisma.user.count();
  }

  private async getNewUsers(): Promise<number> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await this.prisma.user.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    });
  }

  private async getTopPerformingUsers(): Promise<
    Array<{
      userId: string;
      email: string;
      score: number;
      casesCompleted: number;
    }>
  > {
    try {
      const topUsers = await this.prisma.userProgress.groupBy({
        by: ['userId'],
        _sum: {
          score: true,
        },
        _count: {
          caseId: true,
        },
        orderBy: {
          _sum: {
            score: 'desc',
          },
        },
        take: 10,
      });

      const userIds = topUsers.map((u) => u.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true },
      });

      return topUsers.map((user, index) => ({
        userId: user.userId,
        email: users.find((u) => u.id === user.userId)?.email || 'Unknown',
        score: user._sum.score || 0,
        casesCompleted: user._count.caseId,
      }));
    } catch (error) {
      this.logger.warn('Failed to get top performing users:', error);
      return [];
    }
  }

  private async calculateUserEngagement(): Promise<number> {
    try {
      const totalUsers = await this.prisma.user.count();
      const activeUsers = await this.getActiveUsers();
      return totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    } catch (error) {
      this.logger.warn('Failed to calculate user engagement:', error);
      return 0;
    }
  }

  private async calculateUserRetention(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const [currentUsers, previousUsers] = await Promise.all([
        this.prisma.user.count({
          where: {
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        this.prisma.user.count({
          where: {
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          },
        }),
      ]);

      return previousUsers > 0 ? (currentUsers / previousUsers) * 100 : 100;
    } catch (error) {
      this.logger.warn('Failed to calculate user retention:', error);
      return 0;
    }
  }

  private async checkDatabaseHealth(): Promise<
    'healthy' | 'warning' | 'critical'
  > {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'healthy';
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return 'critical';
    }
  }

  private async checkRedisHealth(): Promise<
    'healthy' | 'warning' | 'critical'
  > {
    try {
      // In a real implementation, this would check Redis connection
      // For now, return healthy
      return 'healthy';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return 'critical';
    }
  }

  private async checkExternalServicesHealth(): Promise<
    'healthy' | 'warning' | 'critical'
  > {
    try {
      // In a real implementation, this would check external services
      // For now, return healthy
      return 'healthy';
    } catch (error) {
      this.logger.error('External services health check failed:', error);
      return 'critical';
    }
  }

  private calculateOverallHealth(
    database: 'healthy' | 'warning' | 'critical',
    redis: 'healthy' | 'warning' | 'critical',
    externalServices: 'healthy' | 'warning' | 'critical',
  ): 'healthy' | 'warning' | 'critical' {
    if ([database, redis, externalServices].includes('critical')) {
      return 'critical';
    }
    if ([database, redis, externalServices].includes('warning')) {
      return 'warning';
    }
    return 'healthy';
  }
}
