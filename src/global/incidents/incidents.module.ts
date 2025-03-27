import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [
    PrismaModule,
  ],
  providers: [IncidentsService],
  controllers: [IncidentsController]
})
export class IncidentsModule {}
