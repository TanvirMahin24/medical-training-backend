import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';

@Module({
  imports: [PrismaModule],
  controllers: [BadgesController],
  providers: [BadgesService],
})
export class BadgesModule {}
