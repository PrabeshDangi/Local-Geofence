import { Controller, Get, HttpCode, Query, Req, UseGuards } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { JwtGuard } from 'src/common/Guard/access.guard';
import { QueryInputDto } from '../dto/calc.dto';

@Controller('calculation')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Get('nearby-incidents')
  async getNearByIncidents(@Query() QueryData: QueryInputDto,@Req() req) {

    
    const nearbyIncidents =
      await this.calculationService.getNearByIncidents(QueryData);

    return {
      message: 'Incidents fetched successfully!!',
      count:nearbyIncidents.length,
      data: nearbyIncidents,
    };
  }
}
