import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { QueryInputDto } from '../dto/calc.dto';

@Injectable()
export class CalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNearByIncidents(data: QueryInputDto): Promise<any> {
    const lat = Number(data.lat);
    const lng = Number(data.lng);

    if (!(Number.isFinite(lat) && Number.isFinite(lng))) {
      throw new HttpException('Invalid latitude or longitude', 400);
    }

    const geofences = await this.prisma.geofence.findMany({});

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
