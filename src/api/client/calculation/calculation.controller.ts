import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { JwtGuard } from 'src/common/Guard/access.guard';

@Controller('calculation')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Get('nearby-incidents')
  async getNearByIncidents(@Req() req) {

    const userId=req.user.id
    
    const nearbyIncidents =
      await this.calculationService.getNearByIncidents(userId);

    return {
      message: 'Incidents fetched successfully!!',
      count:nearbyIncidents.length,
      data: nearbyIncidents,
    };
  }
}
