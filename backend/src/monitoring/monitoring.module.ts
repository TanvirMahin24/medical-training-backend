import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 300000, // 5 minutes
    }),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
