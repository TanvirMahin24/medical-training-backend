import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLoginDto, AdminLoginResponseDto } from '../dto/admin-login.dto';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  AdminUserResponseDto,
} from '../dto/admin-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async adminLogin(loginDto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
      },
    };
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status && status !== 'all') {
      where.subscriptionStatus = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          subscriptionStatus: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string): Promise<AdminUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionStatus: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(
    id: string,
    updateDto: UpdateAdminUserDto,
  ): Promise<AdminUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prepare update data, filtering out undefined values
    const updateData: any = {};
    if (updateDto.firstName !== undefined)
      updateData.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined)
      updateData.lastName = updateDto.lastName;
    if (updateDto.role !== undefined) updateData.role = updateDto.role;
    if (updateDto.subscriptionStatus !== undefined)
      updateData.subscriptionStatus = updateDto.subscriptionStatus;
    if (updateDto.isEmailVerified !== undefined)
      updateData.isEmailVerified = updateDto.isEmailVerified;
    if (updateDto.isActive !== undefined)
      updateData.isActive = updateDto.isActive;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionStatus: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      throw new UnauthorizedException('Cannot delete admin users');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getStats() {
    const [totalUsers, activeUsers, totalCases, totalRevenue] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({
          where: { subscriptionStatus: { in: ['ACTIVE', 'TRIAL'] } },
        }),
        this.prisma.medicalCase.count(),
        this.prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      totalCases,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyGrowth: 12.5, // Mock data for now
      userEngagement: 78.3, // Mock data for now
    };
  }

  // Subscription Management Methods
  async getSubscriptions(
    page: number = 1,
    limit: number = 10,
    status?: string,
    planType?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (planType && planType !== 'all') {
      where.planType = planType;
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSubscriptionById(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async createSubscription(createDto: any) {
    const { userId, planType, stripeSubscriptionId, ...data } = createDto;

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planType,
        stripeSubscriptionId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update user subscription status
    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'ACTIVE' },
    });

    return subscription;
  }

  async updateSubscription(id: string, updateDto: any) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedSubscription;
  }

  async cancelSubscription(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        canceledAt: new Date(),
        endedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update user subscription status
    await this.prisma.user.update({
      where: { id: subscription.userId },
      data: { subscriptionStatus: 'CANCELLED' },
    });

    return updatedSubscription;
  }

  async reactivateSubscription(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        canceledAt: null,
        endedAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update user subscription status
    await this.prisma.user.update({
      where: { id: subscription.userId },
      data: { subscriptionStatus: 'ACTIVE' },
    });

    return updatedSubscription;
  }

  async getSubscriptionPlans() {
    // For now, return predefined plans
    // In a real implementation, you might have a separate plans table
    return [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential features for medical professionals',
        price: 29.99,
        features: ['Access to basic cases', 'Progress tracking', 'Basic analytics'],
        isActive: true,
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Advanced features for serious learners',
        price: 59.99,
        features: ['All cases', 'Advanced analytics', 'Priority support', 'Custom badges'],
        isActive: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Full access for institutions and teams',
        price: 99.99,
        features: ['Team management', 'Advanced reporting', 'API access', 'Custom content'],
        isActive: true,
      },
    ];
  }

  async createSubscriptionPlan(createDto: any) {
    // In a real implementation, you would save this to a plans table
    // For now, return the created plan data
    return {
      id: `plan_${Date.now()}`,
      ...createDto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateSubscriptionPlan(id: string, updateDto: any) {
    // In a real implementation, you would update the plan in a plans table
    // For now, return the updated plan data
    return {
      id,
      ...updateDto,
      updatedAt: new Date(),
    };
  }

  async deleteSubscriptionPlan(id: string) {
    // In a real implementation, you would delete the plan from a plans table
    // For now, just return success
    return { message: 'Subscription plan deleted successfully' };
  }
}
