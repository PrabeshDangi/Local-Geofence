import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../services/notification/notification.service';

@Module({
  controllers: [SchedulerController],
  providers: [SchedulerService,PrismaService,NotificationService],
})
export class SchedulerModule {}
