import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, toZonedTime } from 'date-fns-tz';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllIncidents(isArchived: boolean) {
    const response = await this.prisma.geofence.findMany({
      where: {
        archive: isArchived,
      },
      orderBy: { incidentOn: 'desc' },
    });
    const nepalTimeZone = 'Asia/Kathmandu';

    return response.map((incident) => {
      return {
        id: incident.id,
        name: incident.name,
        description: incident.description,
        longitude: incident.longitude,
        latitude: incident.latitude,
        incidentOn: incident.incidentOn
          ? format(
              toZonedTime(new Date(incident.incidentOn), nepalTimeZone),
              'yyyy-MM-dd HH:mm:ssXXX',
              { timeZone: nepalTimeZone },
            )
          : null,
        reportedOn: incident.reportedOn
          ? format(
              toZonedTime(new Date(incident.reportedOn), nepalTimeZone),
              'yyyy-MM-dd HH:mm:ssXXX',
              { timeZone: nepalTimeZone },
            )
          : null,
        verified: incident.verified,
        dataSource: incident.dataSource,
        hazard: incident.hazard,
        radiusPrimary: incident.radiusPrimary,
        radiusSecondary: incident.radiusSecondary,
        archive: incident.archive,
        createdAt: incident.createdAt,
        updatedAt: incident.updatedAt,
      };
    });
  }

  async getIncidentById(id: number) {
    const incident = await this.prisma.geofence.findUnique({
      where: { id, archive: false },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found or archived');
    }

    return incident;
  }
}
