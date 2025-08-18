import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

export interface CaseAnalytics {
  totalCases: number;
  completedCases: number;
  averageScore: number;
  difficultyDistribution: {
    BEGINNER: number;
    INTERMEDIATE: number;
    ADVANCED: number;
    EXPERT: number;
  };
  categoryDistribution: Array<{
    category: string;
    count: number;
    averageScore: number;
  }>;
  topPerformingCases: Array<{
    caseId: string;
    title: string;
    averageScore: number;
    completionRate: number;
  }>;
}

export interface UserBehaviorAnalytics {
  sessionDuration: {
    average: number;
    median: number;
    distribution: Array<{ range: string; count: number }>;
  };
  userJourney: {
    onboardingCompletion: number;
    firstCaseCompletion: number;
    retentionByDay: Array<{ day: number; users: number }>;
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionsPerUser: number;
  };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  subscriptionMetrics: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    churnRate: number;
    averageRevenuePerUser: number;
  };
  planDistribution: Array<{
    plan: string;
    users: number;
    revenue: number;
  }>;
}

export interface LearningAnalytics {
  skillProgression: Array<{
    skill: string;
    averageImprovement: number;
    usersCount: number;
  }>;
  learningPath: {
    recommendedNextCase: Array<{
      userId: string;
      caseId: string;
      reason: string;
      confidence: number;
    }>;
    skillGaps: Array<{
      userId: string;
      missingSkills: string[];
      recommendedCases: string[];
    }>;
  };
  competencyMapping: Array<{
    competency: string;
    usersCount: number;
    averageLevel: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly cacheKeys = {
    caseAnalytics: 'case_analytics',
    userBehavior: 'user_behavior_analytics',
    revenue: 'revenue_analytics',
    learning: 'learning_analytics',
  };

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCaseAnalytics(): Promise<CaseAnalytics> {
    try {
      const cached = await this.cacheManager.get<CaseAnalytics>(
        this.cacheKeys.caseAnalytics,
      );
      if (cached) {
        return cached;
      }

      const [
        totalCases,
        completedCases,
        averageScore,
        difficultyDistribution,
        categoryDistribution,
        topPerformingCases,
      ] = await Promise.all([
        this.getTotalCases(),
        this.getCompletedCases(),
        this.getAverageScore(),
        this.getDifficultyDistribution(),
        this.getCategoryDistribution(),
        this.getTopPerformingCases(),
      ]);

      const analytics: CaseAnalytics = {
        totalCases,
        completedCases,
        averageScore,
        difficultyDistribution,
        categoryDistribution,
        topPerformingCases,
      };

      await this.cacheManager.set(
        this.cacheKeys.caseAnalytics,
        analytics,
        600000,
      );
      return analytics;
    } catch (error) {
      this.logger.error('Failed to get case analytics:', error);
      throw error;
    }
  }

  async getUserBehaviorAnalytics(): Promise<UserBehaviorAnalytics> {
    try {
      const cached = await this.cacheManager.get<UserBehaviorAnalytics>(
        this.cacheKeys.userBehavior,
      );
      if (cached) {
        return cached;
      }

      const [sessionDuration, userJourney, engagementMetrics] =
        await Promise.all([
          this.getSessionDurationAnalytics(),
          this.getUserJourneyAnalytics(),
          this.getEngagementMetrics(),
        ]);

      const analytics: UserBehaviorAnalytics = {
        sessionDuration,
        userJourney,
        engagementMetrics,
      };

      await this.cacheManager.set(
        this.cacheKeys.userBehavior,
        analytics,
        600000,
      );
      return analytics;
    } catch (error) {
      this.logger.error('Failed to get user behavior analytics:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    try {
      const cached = await this.cacheManager.get<RevenueAnalytics>(
        this.cacheKeys.revenue,
      );
      if (cached) {
        return cached;
      }

      const [
        totalRevenue,
        monthlyRevenue,
        subscriptionMetrics,
        planDistribution,
      ] = await Promise.all([
        this.getTotalRevenue(),
        this.getMonthlyRevenue(),
        this.getSubscriptionMetrics(),
        this.getPlanDistribution(),
      ]);

      const analytics: RevenueAnalytics = {
        totalRevenue,
        monthlyRevenue,
        subscriptionMetrics,
        planDistribution,
      };

      await this.cacheManager.set(this.cacheKeys.revenue, analytics, 600000);
      return analytics;
    } catch (error) {
      this.logger.error('Failed to get revenue analytics:', error);
      throw error;
    }
  }

  async getLearningAnalytics(): Promise<LearningAnalytics> {
    try {
      const cached = await this.cacheManager.get<LearningAnalytics>(
        this.cacheKeys.learning,
      );
      if (cached) {
        return cached;
      }

      const [skillProgression, learningPath, competencyMapping] =
        await Promise.all([
          this.getSkillProgression(),
          this.getLearningPath(),
          this.getCompetencyMapping(),
        ]);

      const analytics: LearningAnalytics = {
        skillProgression,
        learningPath,
        competencyMapping,
      };

      await this.cacheManager.set(this.cacheKeys.learning, analytics, 600000);
      return analytics;
    } catch (error) {
      this.logger.error('Failed to get learning analytics:', error);
      throw error;
    }
  }

  async getComprehensiveAnalytics() {
    const [caseAnalytics, userBehavior, revenue, learning] = await Promise.all([
      this.getCaseAnalytics(),
      this.getUserBehaviorAnalytics(),
      this.getRevenueAnalytics(),
      this.getLearningAnalytics(),
    ]);

    return {
      caseAnalytics,
      userBehavior,
      revenue,
      learning,
      timestamp: new Date(),
    };
  }

  private async getTotalCases(): Promise<number> {
    return await this.prisma.medicalCase.count();
  }

  private async getCompletedCases(): Promise<number> {
    return await this.prisma.userProgress.count({
      where: {
        completedAt: { not: null },
      },
    });
  }

  private async getAverageScore(): Promise<number> {
    const result = await this.prisma.userProgress.aggregate({
      _avg: { score: true },
      where: {
        completedAt: { not: null },
      },
    });
    return result._avg.score || 0;
  }

  private async getDifficultyDistribution() {
    const distribution = await this.prisma.medicalCase.groupBy({
      by: ['difficulty'],
      _count: { id: true },
    });

    const result = {
      BEGINNER: 0,
      INTERMEDIATE: 0,
      ADVANCED: 0,
      EXPERT: 0,
    };

    distribution.forEach((item) => {
      result[item.difficulty] = item._count.id;
    });

    return result;
  }

  private async getCategoryDistribution() {
    const distribution = await this.prisma.medicalCase.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const categoryIds = distribution.map((d) => d.category);
    const caseIds = await this.prisma.medicalCase.findMany({
      where: { category: { in: categoryIds } },
      select: { id: true, category: true },
    });

    const categoryScores = await Promise.all(
      categoryIds.map(async (category) => {
        const caseIdsForCategory = caseIds
          .filter((c) => c.category === category)
          .map((c) => c.id);

        const avgScore = await this.prisma.userProgress.aggregate({
          _avg: { score: true },
          where: {
            caseId: { in: caseIdsForCategory },
            completedAt: { not: null },
          },
        });

        return {
          category,
          count:
            distribution.find((d) => d.category === category)?._count.id || 0,
          averageScore: avgScore._avg.score || 0,
        };
      }),
    );

    return categoryScores;
  }

  private async getTopPerformingCases() {
    const topCases = await this.prisma.userProgress.groupBy({
      by: ['caseId'],
      _avg: { score: true },
      _count: { id: true },
      orderBy: {
        _avg: { score: 'desc' },
      },
      take: 10,
    });

    const caseIds = topCases.map((t) => t.caseId);
    const cases = await this.prisma.medicalCase.findMany({
      where: { id: { in: caseIds } },
      select: { id: true, title: true },
    });

    return topCases.map((topCase) => {
      const caseInfo = cases.find((c) => c.id === topCase.caseId);
      return {
        caseId: topCase.caseId,
        title: caseInfo?.title || 'Unknown Case',
        averageScore: topCase._avg.score || 0,
        completionRate: topCase._count.id,
      };
    });
  }

  private async getSessionDurationAnalytics() {
    // Simulated session duration analytics
    return {
      average: 1800, // 30 minutes
      median: 1500, // 25 minutes
      distribution: [
        { range: '0-15 min', count: 150 },
        { range: '15-30 min', count: 300 },
        { range: '30-60 min', count: 200 },
        { range: '60+ min', count: 100 },
      ],
    };
  }

  private async getUserJourneyAnalytics() {
    const totalUsers = await this.prisma.user.count();
    const usersWithProgress = await this.prisma.userProgress.count();

    return {
      onboardingCompletion:
        totalUsers > 0 ? (usersWithProgress / totalUsers) * 100 : 0,
      firstCaseCompletion: usersWithProgress,
      retentionByDay: [
        { day: 1, users: totalUsers },
        { day: 7, users: Math.floor(totalUsers * 0.8) },
        { day: 30, users: Math.floor(totalUsers * 0.6) },
      ],
    };
  }

  private async getEngagementMetrics() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: {
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    return {
      dailyActiveUsers: activeUsers,
      weeklyActiveUsers: Math.floor(totalUsers * 0.7),
      monthlyActiveUsers: Math.floor(totalUsers * 0.5),
      averageSessionsPerUser: 2.5,
    };
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    return result._sum.amount || 0;
  }

  private async getMonthlyRevenue() {
    // Simulated monthly revenue data
    return [
      { month: 'Jan', revenue: 5000 },
      { month: 'Feb', revenue: 6000 },
      { month: 'Mar', revenue: 7500 },
      { month: 'Apr', revenue: 8000 },
      { month: 'May', revenue: 9000 },
      { month: 'Jun', revenue: 10000 },
    ];
  }

  private async getSubscriptionMetrics() {
    const totalSubscriptions = await this.prisma.subscription.count();
    const activeSubscriptions = await this.prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });

    return {
      totalSubscriptions,
      activeSubscriptions,
      churnRate: 5.2, // 5.2% monthly churn
      averageRevenuePerUser: 29.99,
    };
  }

  private async getPlanDistribution() {
    const distribution = await this.prisma.subscription.groupBy({
      by: ['planType'],
      _count: { id: true },
    });

    return distribution.map((plan) => ({
      plan: plan.planType,
      users: plan._count.id,
      revenue: plan._count.id * 29.99, // Simplified calculation
    }));
  }

  private async getSkillProgression() {
    // Simulated skill progression data
    return [
      { skill: 'Patient Assessment', averageImprovement: 25, usersCount: 150 },
      { skill: 'Diagnosis', averageImprovement: 30, usersCount: 120 },
      { skill: 'Treatment Planning', averageImprovement: 20, usersCount: 100 },
      { skill: 'Emergency Response', averageImprovement: 35, usersCount: 80 },
    ];
  }

  private async getLearningPath() {
    // Simulated learning path recommendations
    return {
      recommendedNextCase: [
        {
          userId: 'user1',
          caseId: 'case-hypertension-002',
          reason: 'Based on previous performance in cardiology cases',
          confidence: 0.85,
        },
      ],
      skillGaps: [
        {
          userId: 'user2',
          missingSkills: ['Emergency Response', 'Pediatric Care'],
          recommendedCases: ['case-emergency-001', 'case-pediatric-001'],
        },
      ],
    };
  }

  private async getCompetencyMapping() {
    // Simulated competency mapping
    return [
      { competency: 'Clinical Reasoning', usersCount: 200, averageLevel: 3.5 },
      {
        competency: 'Patient Communication',
        usersCount: 180,
        averageLevel: 3.2,
      },
      { competency: 'Technical Skills', usersCount: 150, averageLevel: 3.8 },
      { competency: 'Critical Thinking', usersCount: 120, averageLevel: 3.0 },
    ];
  }
}
