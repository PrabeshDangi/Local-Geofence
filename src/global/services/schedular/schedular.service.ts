import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { subDays } from 'date-fns';
import { IncidentsService } from 'src/global/incidents/incidents.service';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class SchedularService {
  private readonly logger = new Logger(IncidentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleIncidentRefresh() {
    try {
      await this.refreshIncidentData();
      this.logger.log('Incident/geofence data refreshed');
    } catch (error) {
      this.logger.error('Failed to refresh incident/geofence data', error);
    }
  }

  async refreshIncidentData() {
    const fiveDaysAgo = subDays(new Date(), 5);

    await this.prisma.$transaction(async (tx) => {
      await tx.geofence.deleteMany({
        where: {
          incidentOn: {
            lt: fiveDaysAgo,
          },
        },
      });

      const newIncidents = await this.fetchRecentIncidents(fiveDaysAgo);

      if (newIncidents.length > 0) {
        await tx.geofence.createMany({
          data: newIncidents.map((incident) => ({
            name: incident.title,
            description: incident.description || '',
            longitude: incident.coordinates[0],
            latitude: incident.coordinates[1],
            incidentOn: new Date(incident.incidentOn),
            reportedOn: new Date(incident.reportedOn),
            verified: incident.verified,
            dataSource: incident.dataSource,
            radiusPrimary: 1000,
            radiusSecondary: 2000,
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
}
