import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { Request } from 'express';
import { Geofence } from '@prisma/client';
import { updateGeoFenceDTO } from './dto/updategeofence.dto';

@Injectable()
export class GeofenceService {
  constructor(private readonly prisma: PrismaService) {}

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
