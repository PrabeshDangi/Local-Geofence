import { Module } from '@nestjs/common';
import { PrismaModule } from './global/prisma/prisma.module';
import { AdminModule } from './api/admin/admin.module';
import { ClientModule } from './api/client/client.module';
import { AuthModule } from './common/auth/auth.module';
import { IncidentsModule } from './global/incidents/incidents.module';
import { SchedularService } from './global/services/schedular/schedular.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    ClientModule,
    AuthModule,
    IncidentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SchedularService],
})
export class AppModule {}
