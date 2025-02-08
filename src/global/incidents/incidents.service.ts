import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllIncidents(isArchived: boolean) {
    return this.prisma.geofence.findMany({
      where: {
        archive: isArchived,
      },
      orderBy: { incidentOn: 'desc' },
    });
  }

  async getIncidentById(id: number) {
    const incident = await this.prisma.geofence.findUnique({
      where: { id, archive: false },
      select: {
        id: true,
        name: true,
        description: true,
        longitude: true,
        latitude: true,
        incidentOn: true,
        reportedOn: true,
        verified: true,
        dataSource: true,
      },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found or archived');
    }

    return incident;
  }
}
