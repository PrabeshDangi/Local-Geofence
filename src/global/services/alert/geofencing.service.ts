import { Injectable } from '@nestjs/common';

@Injectable()
export class GeofencingService {
  // Calculate if a point is inside the geofence radius (in kilometers)
  checkGeofence(
    userLat: number,
    userLng: number,
    geoLat: number,
    geoLng: number,
    radius: number,
  ): boolean {
    const distance = this.haversineDistance(userLat, userLng, geoLat, geoLng);
    return distance <= radius; // If the distance is less than or equal to the radius, user is in the geofence
  }

  // Haversine formula to calculate distance between two lat/lng points (in kilometers)
  haversineDistance(
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

    return R * c * 1000; // Distance in meters
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
