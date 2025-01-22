import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GeofenceModule } from './geofence/geofence.module';

@Module({
      imports: [AuthModule, GeofenceModule],
      controllers: [],
      providers: [],
})
export class AdminModule {}
