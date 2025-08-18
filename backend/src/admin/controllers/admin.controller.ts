import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { AdminLoginDto, AdminLoginResponseDto } from '../dto/admin-login.dto';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  AdminUserResponseDto,
} from '../dto/admin-user.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'Admin login successful',
    type: AdminLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or admin access required',
  })
  async adminLogin(
    @Body() loginDto: AdminLoginDto,
  ): Promise<AdminLoginResponseDto> {
    return this.adminService.adminLogin(loginDto);
  }

  @Get('users')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers(
      parseInt(page),
      parseInt(limit),
      search,
      role,
      status,
    );
  }

  @Get('users/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: AdminUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserById(@Param('id') id: string): Promise<AdminUserResponseDto> {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: AdminUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdminUserDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateUser(id, updateDto);
  }

  @Delete('users/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot delete admin users',
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteUser(id);
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('profile')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    };
  }

  @Get('subscriptions')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all subscriptions with pagination and filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'planType', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSubscriptions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('planType') planType?: string,
  ) {
    return this.adminService.getSubscriptions(
      parseInt(page),
      parseInt(limit),
      status,
      planType,
    );
  }

  @Get('subscriptions/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSubscriptionById(@Param('id') id: string) {
    return this.adminService.getSubscriptionById(id);
  }

  @Post('subscriptions')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid subscription data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createSubscription(@Body() createDto: any) {
    return this.adminService.createSubscription(createDto);
  }

  @Put('subscriptions/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateSubscription(@Param('id') id: string, @Body() updateDto: any) {
    return this.adminService.updateSubscription(id, updateDto);
  }

  @Delete('subscriptions/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async cancelSubscription(@Param('id') id: string) {
    return this.adminService.cancelSubscription(id);
  }

  @Post('subscriptions/:id/reactivate')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivate cancelled subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription reactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async reactivateSubscription(@Param('id') id: string) {
    return this.adminService.reactivateSubscription(id);
  }
}
