import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UpdateGeoFenceDTO } from './dto/updategeofence.dto';
import { GeofenceService } from './geofence.service';
import { JwtGuard } from 'src/common/Guard/access.guard';
import { RolesGuard } from 'src/common/Guard/role.guard';
import { Roles } from 'src/common/Decorator/Role.decorator';
import { Role } from 'src/common/Constants/enums/role.enum';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('geofence')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Patch(':id')
  async updateGeofence(
    @Param('id', ParseIntPipe) id: number,
    @Body() updategeofencedto: UpdateGeoFenceDTO,
  ) {
    try {
      const result = await this.geofenceService.updateGeofence(
        id,
        updategeofencedto,
      );
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Delete(':id')
  async deleteGeofence(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.geofenceService.deleteGeofence(id);
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post(':id')
  async archiveGeofence(
    @Param('id', ParseIntPipe) id: number,
    @Query('archive') archiveQuery: string,
  ) {
    try {
      const archive = archiveQuery === 'true';

      const result = await this.geofenceService.archiveGeofence(id, archive);

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
