import { Module } from '@nestjs/common';
import { PrismaModule } from './global/prisma/prisma.module';
import { AdminModule } from './api/admin/admin.module';
import { ClientModule } from './api/client/client.module';
import { AuthModule } from './common/auth/auth.module';
import { IncidentsModule } from './global/incidents/incidents.module';
import { SchedularService } from './global/services/schedular/schedular.service';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    ClientModule,
    AuthModule,
    IncidentsModule,
  ],
  controllers: [],
  providers: [SchedularService],
})
export class AppModule {}
