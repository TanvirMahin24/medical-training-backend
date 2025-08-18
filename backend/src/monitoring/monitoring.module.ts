import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    CacheModule.register({
      ttl: 300000, // 5 minutes
    }),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
