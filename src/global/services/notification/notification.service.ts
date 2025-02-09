import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {
    // Initialize Firebase Admin SDK with service account credentials
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
  }

  // Send Push Notification to the User
  async sendPushNotification(
    userId: number,
    message: string,
    title: string = 'Disaster Alert',
  ) {
    const deviceToken = await this.getDeviceToken(userId);

    if (!deviceToken) {
      this.logger.error(`No device token found for user ${userId}`);
      return;
    }

    try {
      await this.sendFCMNotification(deviceToken, title, message);
      this.logger.log(`Notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user ${userId}: ${error.message}`,
      );
    }
  }

  private async sendFCMNotification(
    deviceToken: string,
    title: string,
    message: string,
  ) {
    try {
      const response = await admin.messaging().send({
        token: deviceToken,
        notification: {
          title: title,
          body: message,
        },
      });

      this.logger.log(
        `Push notification sent to device ${deviceToken} with message: ${message} (Response: ${response})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to device ${deviceToken}: ${error.message}`,
      );
    }
  }

  private async getDeviceToken(userId: number): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { deviceToken: true },
    });

    if (!user || !user.deviceToken) {
      return null;
    }

    return user.deviceToken;
  }
}
