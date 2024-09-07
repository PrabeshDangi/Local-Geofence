import { Module } from '@nestjs/common';
import { PrismaModule } from './global/prisma/prisma.module';
import { AuthModule } from './api/auth/auth.module';
import { GeofenceModule } from './api/geofence/geofence.module';
import { AtStrategy } from './api/auth/Strategies/at.strategies';

@Module({
  imports: [PrismaModule, AuthModule, GeofenceModule],
  controllers: [],
  providers: [AtStrategy],
})
export class AppModule {}
