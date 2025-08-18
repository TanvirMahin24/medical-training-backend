import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartSimulationDto } from './dto/start-simulation.dto';
import { UpdateSimulationProgressDto } from './dto/update-simulation-progress.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async getAllCases() {
    return this.prisma.medicalCase.findMany({
      where: { isActive: true, isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        tags: true,
        estimatedDuration: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getCaseById(id: string) {
    const caseData = await this.prisma.medicalCase.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        tags: true,
        estimatedDuration: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    return caseData;
  }

  async getSimulationData(id: string) {
    const caseData = await this.prisma.medicalCase.findUnique({
      where: { id },
      select: { content: true },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    return caseData.content;
  }

  async startSimulation(caseId: string, userId: string, startData: StartSimulationDto) {
    const caseData = await this.prisma.medicalCase.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    // Create or update simulation session
    const session = await this.prisma.simulationSession.upsert({
      where: {
        userId_caseId: { userId, caseId },
      },
      update: {
        currentVisit: 1,
        currentTask: null,
        playerPosition: startData.initialPosition || { x: 50, y: 50 },
        gameState: { isActive: true, startTime: startData.startTime },
        score: 0,
        timeSpent: 0,
        completedTasks: [],
        patientState: 'waiting',
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        caseId,
        currentVisit: 1,
        currentTask: null,
        playerPosition: startData.initialPosition || { x: 50, y: 50 },
        gameState: { isActive: true, startTime: startData.startTime },
        score: 0,
        timeSpent: 0,
        completedTasks: [],
        patientState: 'waiting',
        isActive: true,
      },
    });

    return {
      session,
      caseData: caseData.content,
      initialTasks: this.getInitialTasks(caseData.content),
    };
  }

  async updateSimulationProgress(
    caseId: string,
    userId: string,
    progressData: UpdateSimulationProgressDto,
  ) {
    const session = await this.prisma.simulationSession.findUnique({
      where: { userId_caseId: { userId, caseId } },
    });

    if (!session) {
      throw new NotFoundException('Simulation session not found');
    }

    const updatedSession = await this.prisma.simulationSession.update({
      where: { userId_caseId: { userId, caseId } },
      data: {
        currentVisit: progressData.currentVisit,
        currentTask: progressData.currentTask,
        playerPosition: progressData.playerPosition,
        gameState: progressData.gameState,
        timeSpent: progressData.timeSpent,
        patientState: progressData.patientState,
        updatedAt: new Date(),
      },
    });

    return updatedSession;
  }

  async completeTask(caseId: string, userId: string, taskData: CompleteTaskDto) {
    const session = await this.prisma.simulationSession.findUnique({
      where: { userId_caseId: { userId, caseId } },
    });

    if (!session) {
      throw new NotFoundException('Simulation session not found');
    }

    // Calculate score based on task completion
    const score = this.calculateTaskScore(taskData);

    // Update session
    const updatedSession = await this.prisma.simulationSession.update({
      where: { userId_caseId: { userId, caseId } },
      data: {
        score: session.score + score,
        completedTasks: [...session.completedTasks, taskData.taskId],
        currentTask: this.getNextTask(session, taskData.taskId),
        timeSpent: session.timeSpent + taskData.timeSpent,
        updatedAt: new Date(),
      },
    });

    return {
      session: updatedSession,
      scoreEarned: score,
      nextTask: updatedSession.currentTask,
    };
  }

  private calculateTaskScore(taskData: CompleteTaskDto): number {
    let baseScore = taskData.score;

    // Apply time bonuses/penalties if expected time is provided
    if (taskData.expectedTime) {
      if (taskData.timeSpent < taskData.expectedTime) {
        baseScore += 25; // Time bonus
      } else if (taskData.timeSpent > taskData.expectedTime * 1.5) {
        baseScore -= 25; // Time penalty
      }
    }

    // Apply accuracy bonuses/penalties if accuracy is provided
    if (taskData.accuracy !== undefined) {
      if (taskData.accuracy > 0.9) {
        baseScore += 25; // High accuracy bonus
      } else if (taskData.accuracy < 0.7) {
        baseScore -= 50; // Low accuracy penalty
      }
    }

    return Math.max(0, baseScore);
  }

  private getInitialTasks(content: any): any[] {
    if (!content?.visits || content.visits.length === 0) {
      return [];
    }

    const firstVisit = content.visits[0];
    return firstVisit.tasks_for_visit || [];
  }

  private getNextTask(session: any, completedTaskId: string): string | null {
    // This is a simplified version - in a real implementation,
    // you'd have more complex task dependency logic
    const caseData = session.case; // You'd need to fetch this or pass it in
    if (!caseData?.content?.visits) return null;

    const currentVisit = caseData.content.visits[session.currentVisit - 1];
    if (!currentVisit?.tasks_for_visit) return null;

    const completedIndex = currentVisit.tasks_for_visit.findIndex(
      (task: any) => task.id === completedTaskId,
    );

    if (completedIndex === -1 || completedIndex >= currentVisit.tasks_for_visit.length - 1) {
      return null; // No more tasks in current visit
    }

    return currentVisit.tasks_for_visit[completedIndex + 1].id;
  }
}
