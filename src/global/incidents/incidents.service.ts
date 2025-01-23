import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { subDays } from 'date-fns';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyIncidentRefresh() {
    try {
      await this.refreshIncidentData();
    } catch (error) {
      this.logger.error('Failed to refresh incident data', error);
    }
  }

  async refreshIncidentData() {
    const fiveDaysAgo = subDays(new Date(), 5);

    await this.prisma.$transaction(async (tx) => {
      // Delete old incidents
      await tx.incident.deleteMany({
        where: {
          incidentOn: {
            lt: fiveDaysAgo,
          },
        },
      });

      // Fetch new incidents
      const newIncidents = await this.fetchRecentIncidents();

      // Insert new incidents
      if (newIncidents.length > 0) {
        await tx.incident.createMany({
          data: newIncidents.map((incident) => ({
            title: incident.title,
            titleNe: incident.titleNe,
            coordinates: incident.point
              ? JSON.stringify(incident.point.coordinates)
              : null,
            incidentOn: new Date(incident.incidentOn),
            reportedOn: new Date(incident.reportedOn),
            hazard: incident.hazard,
            loss: incident.loss,
            verified: incident.verified,
            dataSource: incident.dataSource,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async fetchRecentIncidents() {
    try {
      const response = await axios.get(
        'https://bipadportal.gov.np/api/v1/incident/',
        {
          params: {
            incident_on__gt: subDays(new Date(), 5).toISOString(),
            incident_on__lt: new Date().toISOString(),
            ordering: '-incident_on',
            limit: -1,
            data_source: 'drr_api',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch incidents', error);
      return [];
    }
  }

  // Additional methods for incident management
  async getAllIncidents() {
    return this.prisma.incident.findMany({
      orderBy: { incidentOn: 'desc' },
    });
  }
}
