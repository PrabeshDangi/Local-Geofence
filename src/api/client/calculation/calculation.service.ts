import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class CalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNearByIncidents(user: User): Promise<any> {
    const data = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    const lat = Number(data.userLatitude);
    const lng = Number(data.userLongitude);
  
    let geofences = await this.prisma.geofence.findMany({});
    
  
    if ((data.userLatitude || data.userLongitude)=== null) {
      const allGeofences = geofences.map((geofence) => ({
        id: geofence.id,
        name: geofence.name,
        description: geofence.description,
        latitude: geofence.latitude,
        longitude: geofence.longitude,
        hazard: geofence.hazard,
      }));
  
      return {
        count:allGeofences.length,
        nearbyGeofences:allGeofences,
      };
    }
  
    const nearbyGeofences = geofences.filter((geofence) => {
      const distance = this.haversineDistance(
        lat,
        lng,
        geofence.latitude,
        geofence.longitude,
      );
  
      return distance <= 100000;
    });
  
    const sanitizedGeofences = nearbyGeofences.map((geofence) => {
      const distance = this.haversineDistance(
        lat,
        lng,
        geofence.latitude,
        geofence.longitude,
      );
  
      return {
        id: geofence.id,
        name: geofence.name,
        description: geofence.description,
        latitude: geofence.latitude,
        longitude: geofence.longitude,
        hazard: geofence.hazard,
        distance: parseFloat(distance.toFixed(2)),
      };
    });
  
    return {
      count:sanitizedGeofences.length,
      nearbyGeofences: sanitizedGeofences,
    };
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
