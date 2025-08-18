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
}
