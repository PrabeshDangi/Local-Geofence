import { Module } from '@nestjs/common';
import { CalculationModule } from './calculation/calculation.module';

@Module({
  imports: [CalculationModule],
  controllers: [],
  providers: [],
})
export class ClientModule {}
