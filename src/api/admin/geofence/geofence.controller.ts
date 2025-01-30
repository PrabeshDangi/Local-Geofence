import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';

import { updateGeoFenceDTO } from './dto/updategeofence.dto';
import { GeofenceService } from './geofence.service';

@Controller('geofence')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Patch(':id')
  async updateGeofence(
    @Param('id', ParseIntPipe) id: number,
    @Body() updategeofencedto: updateGeoFenceDTO,
    @Req() req,
  ) {
    try {
      const result = await this.geofenceService.updateGeofence(
        id,
        updategeofencedto,
        req,
      );
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Delete(':id')
  async deleteGeofence(@Param('id', ParseIntPipe) id: number, @Req() req) {
    try {
      const result = await this.geofenceService.deleteGeofence(id, req);
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
}
