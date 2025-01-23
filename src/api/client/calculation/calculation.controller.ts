import { Controller } from '@nestjs/common';
import { CalculationService } from './calculation.service';

@Controller('calculation')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}
}
