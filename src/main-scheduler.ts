// main-scheduler.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchedulerService } from './global/services/schedular/schedular.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.get(SchedulerService);
  console.log('Scheduler started');
}
bootstrap();
