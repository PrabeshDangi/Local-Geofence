import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { HttpResponse } from 'src/common/utils/http-response.util';
import { JwtGuard } from 'src/common/Guard/access.guard';

@UseGuards(JwtGuard)
@Controller('incident')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllIncidents(
    @Query('archived') archived: string,
  ): Promise<HttpResponse> {

    const isArchived = archived === 'true';
    const geofences = await this.incidentsService.getAllIncidents(isArchived);

    return new HttpResponse({
      message: 'Geofences fetched successfully!!',
      data: geofences,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getIncidentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse> {
    const geofences = await this.incidentsService.getIncidentById(id);

    return new HttpResponse({
      message: 'Geofences fetched successfully!!',
      data: geofences,
    });
  }
}
