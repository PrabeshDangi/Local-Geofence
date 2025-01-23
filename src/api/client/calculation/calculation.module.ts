import { Module } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { CalculationController } from './calculation.controller';

@Module({
  controllers: [CalculationController],
  providers: [CalculationService],
})
export class CalculationModule {}
