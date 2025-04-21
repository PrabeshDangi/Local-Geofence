import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller()
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('run-scheduler')
  async runSchedulerManually(@Headers('x-api-key') apiKey: string) {
    if (apiKey !== process.env.SCHEDULER_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    await this.schedulerService.refreshIncidentData();
    return { message: 'Scheduler ran successfully!' };
  }
}
