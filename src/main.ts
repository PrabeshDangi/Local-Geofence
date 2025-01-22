import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      disableErrorMessages: false,
    }),
  );

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
