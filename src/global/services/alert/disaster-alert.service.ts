import { Injectable } from '@nestjs/common';
import { GeofencingService } from './geofencing.service';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { redis } from 'src/global/config/redis.config';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class DisasterAlertService {
  constructor(
    private readonly geofencingService: GeofencingService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleUserLocation(
    userId: number,
    latitude: number,
    longitude: number,
  ) {
    const disasters = await this.getGeofences();

    for (const disaster of disasters) {
      const isInSecondary = this.geofencingService.checkGeofence(
        latitude,
        longitude,
        disaster.latitude,
        disaster.longitude,
        disaster.radiusSecondary,
      );

      if (isInSecondary) {
        this.notificationService.sendPushNotification(
          userId,
          'You are entering an alert zone!',
        );
      }

      const isInPrimary = this.geofencingService.checkGeofence(
        latitude,
        longitude,
        disaster.latitude,
        disaster.longitude,
        disaster.radiusPrimary,
      );

      if (isInPrimary) {
        this.notificationService.sendPushNotification(
          userId,
          'You are in a disaster zone!',
          'Disaster Alert',
        );
      }
    }
  }

  async getGeofences() {
    const cachedGeofences = await redis.get('geofences');

    if (cachedGeofences) {
      console.log('Geofences found in Redis');
      return JSON.parse(cachedGeofences as string);
    }

    console.log('Geofences not found in Redis, fetching from DB');
    const geofences = await this.prisma.geofence.findMany();

    await redis.set('geofences', JSON.stringify(geofences), { ex: 3600 });

    return geofences;
  }
}
