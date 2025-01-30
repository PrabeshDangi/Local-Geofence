import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { subDays } from 'date-fns';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async handleIncidentRefresh() {
    try {
      await this.refreshIncidentData();
    } catch (error) {
      this.logger.error('Failed to refresh incident/geofence data', error);
    }
  }

  async refreshIncidentData() {
    const fiveDaysAgo = subDays(new Date(), 5);

    await this.prisma.$transaction(async (tx) => {
      await tx.geofence.deleteMany();

      const newIncidents = await this.fetchRecentIncidents(fiveDaysAgo);

      if (newIncidents.length > 0) {
        await tx.geofence.createMany({
          data: newIncidents.map((incident) => ({
            name: incident.title,
            description: incident.description || '', // Handle if description is null
            longitude: incident.coordinates[0],
            latitude: incident.coordinates[1],
            incidentOn: new Date(incident.incidentOn),
            reportedOn: new Date(incident.reportedOn),
            verified: incident.verified,
            dataSource: incident.dataSource,
            radius: 1000,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async fetchRecentIncidents(fiveDaysAgo: Date) {
    try {
      const response = await axios.get(
        'https://bipadportal.gov.np/api/v1/incident/',
        {
          params: {
            incident_on__gt: fiveDaysAgo.toISOString(),
            incident_on__lt: new Date().toISOString(),
            ordering: '-incident_on',
            limit: -1,
            data_source: 'drr_api',
          },
        },
      );

      return response.data.results.map((incident) => ({
        title: incident.title,
        description: incident.titleNe,
        coordinates: incident.point?.coordinates || [0, 0], // Default to [0, 0] if coordinates are missing
        incidentOn: incident.incidentOn,
        reportedOn: incident.reportedOn,
        verified: incident.verified,
        dataSource: incident.dataSource,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch incidents', error);
      return [];
    }
  }

  // Additional methods for incident management
  async getAllIncidents() {
    return this.prisma.geofence.findMany({
      orderBy: { incidentOn: 'desc' },
    });
  }

  async getIncidentById(id: number) {
    const incident = await this.prisma.geofence.findUnique({
      where: { id },
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
      throw new NotFoundException('Incident not found');
    }

    return incident;
  }
}
