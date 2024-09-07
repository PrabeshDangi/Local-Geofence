import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { createGeofenceDTO } from './dto/addgeofence.dto';
import { Request } from 'express';
import { Geofence } from '@prisma/client';
import { updateGeoFenceDTO } from './dto/updategeofence.dto';

@Injectable()
export class GeofenceService {
  constructor(private prisma: PrismaService) {}

  async addGeofence(
    creategeofencedto: createGeofenceDTO,
    req: Request,
  ): Promise<Geofence> {
    const { name, description, latitude, longitude, radius } =
      creategeofencedto;
    const user = req.body as { id: number; email: string };

    if (!user) {
      throw new ForbiddenException('User not authorized!!');
    }

    const geoFenceAvailable = await this.prisma.geofence.findFirst({
      where: {
        latitude,
        longitude,
        radius,
      },
    });

    if (geoFenceAvailable) {
      throw new ConflictException('Geofence already added!!!');
    }

    const newGeofence = await this.prisma.geofence.create({
      data: {
        name,
        description,
        longitude,
        latitude,
        radius,
      },
    });

    return newGeofence;
  }

  async updateGeofence(
    id: number,
    updategeofencedto: updateGeoFenceDTO,
    req: Request,
  ): Promise<Geofence> {
    const { name, description, radius } = updategeofencedto;
    const user = req.body as { id: number; email: string };

    if (!user) {
      throw new ForbiddenException('User not authorized!!');
    }

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
        radius,
      },
    });

    return updatedGeofence;
  }

  async deleteGeofence(id: number, req: Request): Promise<unknown> {
    const user = req.body as { id: number; email: string };

    if (!user) {
      throw new ForbiddenException('User not authorized!!');
    }

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
}
