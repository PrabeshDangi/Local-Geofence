import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  async sendNotification(deviceToken: string, title: string, body: string) {
    const message = {
      token: deviceToken,
      notification: {
        title: title,
        body: body,
      },
    };
    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw new Error('Error sending notification' + error.message);
    }
  }
}
