import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot()
  ],
  providers: [IncidentsService],
  controllers: [IncidentsController]
})
export class IncidentsModule {}
