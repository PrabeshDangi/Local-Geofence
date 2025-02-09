import { Module } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { CalculationController } from './calculation.controller';
import { PrismaModule } from 'src/global/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CalculationController],
  providers: [CalculationService],
})
export class CalculationModule {}
