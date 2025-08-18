import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, SubscriptionStatus } from '@prisma/client';

export class CreateAdminUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@medicaltraining.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateAdminUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.ADMIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Whether user is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminUserResponseDto {
  @ApiProperty({
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
  })
  firstName?: string | null;

  @ApiProperty({
    description: 'User last name',
  })
  lastName?: string | null;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty({
    description: 'User creation date',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
  })
  updatedAt: Date;
}
