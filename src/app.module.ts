import { Module } from '@nestjs/common';
import { PrismaModule } from './global/prisma/prisma.module';
import { AdminModule } from './api/admin/admin.module';

@Module({
  imports: [PrismaModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
