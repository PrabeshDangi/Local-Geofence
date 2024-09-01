import { Module } from '@nestjs/common';
import { PrismaModule } from './global/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
