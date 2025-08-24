import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AdminGuard } from './guards/admin.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionPlanModule } from './subscription-plan.module';
import { StripePlanService } from './stripe-plan.service';
import { StripePlanController } from './controllers/stripe-plan.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SubscriptionPlanModule,
  ],
  controllers: [AdminController, StripePlanController],
  providers: [AdminService, AdminGuard, StripePlanService],
  exports: [AdminService, AdminGuard, StripePlanService],
})
export class AdminModule {}
