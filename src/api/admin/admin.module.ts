import { Module } from '@nestjs/common';
import { GeofenceModule } from './geofence/geofence.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    GeofenceModule,
    RouterModule.register([
      {
        path: 'admin',
        module: GeofenceModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AdminModule {}
