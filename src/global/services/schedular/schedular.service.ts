import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { subDays } from 'date-fns';
import { IncidentsService } from 'src/global/incidents/incidents.service';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SchedularService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

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
    const allowedHazardCodes = [12, 10, 17, 11];

    await this.prisma.geofence.deleteMany({});

    const newIncidents = await this.fetchRecentIncidents(
      fiveDaysAgo,
      allowedHazardCodes,
    );

    const chunkSize = 5;

    for (let i = 0; i < newIncidents.length; i += chunkSize) {
      const chunk = newIncidents.slice(i, i + chunkSize);

      await this.prisma.$transaction(
        async (tx) => {
          const createPromises = chunk.map((incident) => {
            return tx.geofence.create({
              data: {
                name: incident.title,
                description: incident.description || '',
                longitude: incident.coordinates[0],
                latitude: incident.coordinates[1],
                incidentOn: new Date(incident.incidentOn),
                reportedOn: new Date(incident.reportedOn),
                verified: incident.verified,
                dataSource: incident.dataSource,
                hazard: incident.hazard,
                radiusPrimary: 1000,
                radiusSecondary: 2000,
              },
            });
          });

          return Promise.all(createPromises);
        },
        { timeout: 30000 },
      );
    }
    const users = await this.prisma.user.findMany({
      where: {
        deviceToken: { not: null },
      },
    });

    const uniqueUserIds: number[] = [];

    for (const user of users) {
      uniqueUserIds.push(user.id);
    }

    const message = `New incidents have been reported nearby your location.`;

    await Promise.all(
      Array.from(uniqueUserIds).map((userId) =>
        this.notificationService.sendPushNotification(userId, message),
      ),
    );
  }

  async fetchRecentIncidents(fiveDaysAgo: Date, allowedHazardCodes: number[]) {
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

      const filteredIncidents = response.data.results
        .filter((incident) => allowedHazardCodes.includes(incident.hazard))
        .map((incident) => ({
          title: incident.title,
          description: incident.titleNe,
          coordinates: incident.point?.coordinates || [0, 0], // Default to [0, 0] if coordinates are missing
          incidentOn: incident.incidentOn,
          reportedOn: incident.reportedOn,
          verified: incident.verified,
          dataSource: incident.dataSource,
          hazard: incident.hazard,
        }));

      return filteredIncidents;
    } catch (error) {
      this.logger.error('Failed to fetch incidents', error);
      return [];
    }
  }

  async getNearbyUsers(
    incidentCoordinates: [number, number],
    radiusKm: number,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        userLongitude: { not: null },
        userLatitude: { not: null },
      },
    });

    return users.filter(async (user) => {
      const distance = this.getDistanceFromLatLonInKm(
        incidentCoordinates[1],
        incidentCoordinates[0],
        user.userLatitude,
        user.userLongitude,
      );
      return (await distance) <= radiusKm;
    });
  }

  async getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): Promise<number> {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }
}
