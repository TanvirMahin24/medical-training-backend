import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [totalCases, completedCount, avgScoreAgg, timeAgg, recentScores] =
      await Promise.all([
        this.prisma.medicalCase.count({
          where: { isActive: true, isPublished: true },
        }),
        this.prisma.userProgress.count({
          where: { userId, completedAt: { not: null } },
        }),
        this.prisma.userProgress.aggregate({
          _avg: { score: true },
          where: { userId, completedAt: { not: null } },
        }),
        this.prisma.userProgress.aggregate({
          _sum: { timeSpent: true },
          where: { userId },
        }),
        this.prisma.userProgress.findMany({
          where: { userId, completedAt: { not: null } },
          orderBy: { completedAt: 'desc' },
          take: 10,
          select: {
            score: true,
            completedAt: true,
            timeSpent: true,
            case: { select: { title: true, category: true } },
          },
        }),
      ]);

    // Weekly progress (last 4 weeks)
    const now = new Date();
    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const weeks = Array.from({ length: 4 }).map((_, i) => {
      const end = new Date(startOfDay(now).getTime() - i * 7 * 86400000);
      const start = new Date(end.getTime() - 7 * 86400000);
      return { start, end };
    });

    const weeklyProgress = await Promise.all(
      weeks.map(async (w, idx) => {
        const items = await this.prisma.userProgress.findMany({
          where: { userId, completedAt: { gte: w.start, lt: w.end } },
          select: { score: true },
        });
        const casesCompleted = items.length;
        const averageScore = items.length
          ? Math.round(
              items.reduce((s, it) => s + (it.score || 0), 0) / items.length,
            )
          : 0;
        return { week: `Week ${4 - idx}`, casesCompleted, averageScore };
      }),
    );

    // Category performance
    const completed = await this.prisma.userProgress.findMany({
      where: { userId, completedAt: { not: null } },
      select: {
        timeSpent: true,
        score: true,
        case: { select: { category: true } },
      },
    });
    const categoryMap: Record<
      string,
      { casesCompleted: number; totalScore: number; totalTime: number }
    > = {};
    for (const it of completed) {
      const cat = it.case.category || 'General';
      if (!categoryMap[cat])
        categoryMap[cat] = { casesCompleted: 0, totalScore: 0, totalTime: 0 };
      categoryMap[cat].casesCompleted += 1;
      categoryMap[cat].totalScore += it.score || 0;
      categoryMap[cat].totalTime += it.timeSpent || 0;
    }
    const categoryPerformance = Object.entries(categoryMap).map(
      ([category, v]) => ({
        category,
        casesCompleted: v.casesCompleted,
        averageScore: v.casesCompleted
          ? Math.round(v.totalScore / v.casesCompleted)
          : 0,
        totalTime: v.totalTime,
      }),
    );

    // Streaks (simple calculation based on days with completions)
    const byDate = await this.prisma.userProgress.findMany({
      where: { userId, completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });
    const daysSet = new Set(
      byDate.map((r) => new Date(r.completedAt!).toDateString()),
    );
    let currentStreak = 0;
    let longestStreak = 0;
    let cursor = new Date(startOfDay(now));
    while (daysSet.has(cursor.toDateString())) {
      currentStreak++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
    // approximate longest streak by scanning back 60 days
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(startOfDay(now).getTime() - i * 86400000);
      if (daysSet.has(d.toDateString())) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
    }

    return {
      totalCases,
      completedCases: completedCount,
      averageScore: Math.round((avgScoreAgg._avg.score || 0) * 10) / 10,
      totalTime: timeAgg._sum.timeSpent || 0,
      currentStreak,
      longestStreak,
      weeklyProgress,
      categoryPerformance,
      recentScores: recentScores.map((r) => ({
        caseTitle: r.case.title,
        score: r.score || 0,
        date: r.completedAt?.toISOString() || new Date().toISOString(),
        timeSpent: r.timeSpent || 0,
      })),
    };
  }

  async getLeaderboard() {
    const top = await this.prisma.userProgress.groupBy({
      by: ['userId'],
      _sum: { score: true, timeSpent: true },
      _count: { id: true },
      orderBy: { _sum: { score: 'desc' } },
      take: 20,
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: top.map((t) => t.userId) } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return top.map((t, idx) => {
      const u = users.find((u) => u.id === t.userId);
      return {
        rank: idx + 1,
        userId: t.userId,
        name: u
          ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
          : 'Unknown',
        totalScore: t._sum.score || 0,
        casesCompleted: t._count.id,
        totalTime: t._sum.timeSpent || 0,
      };
    });
  }
}
