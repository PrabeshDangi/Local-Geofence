import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class CalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNearByIncidents(userId: number): Promise<any> {
    const { userLongitude, userLatitude } = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userLatitude: true, userLongitude: true },
    });

    const geofences = await this.prisma.geofence.findMany({});

    const nearbyGeofences = geofences.filter((geofence) => {
      const distance = this.haversineDistance(
        userLatitude,
        userLongitude,
        geofence.latitude,
        geofence.longitude,
      );

      return distance <= 100000; 
    });

    nearbyGeofences.forEach((geofence) => {
      const distance = this.haversineDistance(
        userLatitude,
        userLongitude,
        geofence.latitude,
        geofence.longitude,
      );
      geofence['distance'] = distance;
    });

    return nearbyGeofences;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c * 1000; 
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
