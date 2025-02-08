import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { DisasterAlertService } from '../services/alert/disaster-alert.service';

@WebSocketGateway()
export class UserLocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger('UserLocationGateway');
  private readonly users = new Map<string, any>();

  constructor(private readonly disasterAlertService: DisasterAlertService) {}

  async handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Optionally, connection map bata user hataune
    this.users.delete(client.id);
  }

  @SubscribeMessage('user_location') // Listen for real-time user location updates
  async handleUserLocation(
    @MessageBody()
    data: {
      userId: number;
      latitude: number;
      longitude: number;
      socketId: string;
    },
  ): Promise<void> {
    this.logger.log(
      `Received location for user ${data.userId}: ${data.latitude}, ${data.longitude}`,
    );

    this.users.set(data.socketId, data);

    await this.disasterAlertService.handleUserLocation(
      data.userId,
      data.latitude,
      data.longitude,
    );
  }

  @SubscribeMessage('send_alert')
  sendAlert(@MessageBody() message: string): WsResponse<any> {
    return { event: 'receive_alert', data: message };
  }
}
