import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { Geofence } from '@prisma/client';
import { UpdateGeoFenceDTO } from './dto/updategeofence.dto';

@Injectable()
export class GeofenceService {
  constructor(private readonly prisma: PrismaService) {}

  async updateGeofence(
    id: number,
    updategeofencedto: UpdateGeoFenceDTO,
  ): Promise<Geofence> {
    const { name, description, radius } = updategeofencedto;

    const geoFenceAvailable = await this.prisma.geofence.findUnique({
      where: { id },
    });

    if (!geoFenceAvailable) {
      throw new NotFoundException('Geofence of given id not found!!');
    }

    const updatedGeofence = await this.prisma.geofence.update({
      where: { id },
      data: {
        name,
        description,
        radiusPrimary: radius,
      },
    });

    return updatedGeofence;
  }

  async deleteGeofence(id: number): Promise<unknown> {
    const geoFenceAvailable = await this.prisma.geofence.findUnique({
      where: { id },
    });

    if (!geoFenceAvailable) {
      throw new NotFoundException('Geofence of given id not found!!');
    }

    await this.prisma.geofence.delete({
      where: { id },
    });

    return { message: 'Geofence deleted successfully!!' };
  }

  async archiveGeofence(id: number, archive: boolean) {
    const geoFenceAvailable = await this.prisma.geofence.findUnique({
      where: { id },
    });

    if (!geoFenceAvailable) {
      throw new NotFoundException('Geofence of given id not found!!');
    }

    await this.prisma.geofence.update({
      where: { id },
      data: {
        archive: archive,
      },
    });

    return {
      message: `Geofence archive staus changed to ${archive} successfully!!`,
    };
  }
}
