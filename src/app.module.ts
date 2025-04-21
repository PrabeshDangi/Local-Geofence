import { Module } from '@nestjs/common';
import { PrismaModule } from './global/prisma/prisma.module';
import { AdminModule } from './api/admin/admin.module';
import { ClientModule } from './api/client/client.module';
import { AuthModule } from './common/auth/auth.module';
import { IncidentsModule } from './global/incidents/incidents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationService } from './global/services/notification/notification.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './global/scheduler/scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot({}),
    PrismaModule,
    AdminModule,
    ClientModule,
    AuthModule,
    IncidentsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationService],
})
export class AppModule {}
