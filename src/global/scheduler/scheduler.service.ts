import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { NotificationService } from '../services/notification/notification.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async refreshIncidentData() {
    const now = new Date();
    const threeDaysAgoUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 4),
    );

    await this.prisma.geofence.deleteMany({
      where: {
        incidentOn: {
          lt: threeDaysAgoUTC,
        },
      },
    });

    const allIncidents = await this.fetchIncidents();

    const recentIncidents = allIncidents.filter((incident) => {
      const incidentDate = new Date(incident.incidentOn);
      return incidentDate >= threeDaysAgoUTC;
    });

    this.logger.log(
      `Number of recent incidents to upsert: ${recentIncidents.length}`,
    );

    const chunkSize = 5;
    for (let i = 0; i < recentIncidents.length; i += chunkSize) {
      const chunk = recentIncidents.slice(i, i + chunkSize);

      try {
        await this.prisma.$transaction(
          async (tx) => {
            const upsertPromises = chunk.map((incident) => {
              return tx.geofence.upsert({
                where: {
                  incidentOn_longitude_latitude: {
                    incidentOn: new Date(incident.incidentOn),
                    longitude: incident.coordinates[0],
                    latitude: incident.coordinates[1],
                  },
                },
                update: {
                  name: incident.title,
                  description: incident.description || '',
                  verified: incident.verified,
                  dataSource: incident.dataSource,
                  hazard: incident.hazard,
                  radiusPrimary: 1000,
                  radiusSecondary: 2000,
                },
                create: {
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

            return Promise.all(upsertPromises);
          },
          { timeout: 30000 },
        );
      } catch (error) {
        this.logger.error('Database transaction failed:', error);
      }
    }

    const users = await this.prisma.user.findMany({
      where: { deviceToken: { not: null } },
    });

    const message = `New incidents have been reported nearby your location.`;

    await Promise.all(
      users.map((user) =>
        this.notificationService.sendPushNotification(user.id, message),
      ),
    );

    this.logger.log('Incident data refresh complete.');
  }

  async fetchIncidents() {
    try {
      const response = await axios.get(process.env.BASE_URL);
      return response.data.results.map((incident: any) => {
        return {
          title: incident.title,
          description: incident.titleNe,
          coordinates: incident.point?.coordinates || [0, 0],
          incidentOn: incident.incidentOn,
          reportedOn: incident.reportedOn,
          verified: incident.verified,
          dataSource: incident.dataSource,
          hazard: incident.hazard,
        };
      });
    } catch (error) {
      this.logger.error('Failed to fetch incidents', error);
      return [];
    }
  }
}
