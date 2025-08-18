import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum PlanDuration {
  WEEK = 7,
  MONTH = 30,
  YEAR = 365,
}

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsString()
  tagline: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsEnum(PlanDuration)
  duration: PlanDuration;

  @IsArray()
  @IsString({ each: true })
  keyFeatures: string[];

  @IsNumber()
  casesPerMonth: number;

  @IsNumber()
  simulationsPerMonth: number;

  @IsNumber()
  practiceTests: number;

  @IsNumber()
  certificates: number;

  @IsBoolean()
  prioritySupport: boolean;

  @IsBoolean()
  offlineAccess: boolean;

  @IsBoolean()
  customCases: boolean;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;
}

export class UpdateSubscriptionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PlanDuration)
  duration?: PlanDuration;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyFeatures?: string[];

  @IsOptional()
  @IsNumber()
  casesPerMonth?: number;

  @IsOptional()
  @IsNumber()
  simulationsPerMonth?: number;

  @IsOptional()
  @IsNumber()
  practiceTests?: number;

  @IsOptional()
  @IsNumber()
  certificates?: number;

  @IsOptional()
  @IsBoolean()
  prioritySupport?: boolean;

  @IsOptional()
  @IsBoolean()
  offlineAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  customCases?: boolean;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;
}

export class SubscriptionPlanResponseDto {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  duration: number;
  keyFeatures: string[];
  limits: {
    casesPerMonth: number;
    simulationsPerMonth: number;
    practiceTests: number;
    certificates: number;
    prioritySupport: boolean;
    offlineAccess: boolean;
    customCases: boolean;
  };
  popular?: boolean;
  recommended?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
