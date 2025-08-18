import { Module } from '@nestjs/common';
import { SubscriptionPlanController } from './controllers/subscription-plan.controller';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
