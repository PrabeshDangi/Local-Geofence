import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';


import { createGeofenceDTO } from './dto/addgeofence.dto';
import { updateGeoFenceDTO } from './dto/updategeofence.dto';
import { GeofenceService } from './geofence.service';
import { Role } from 'src/common/Constants/enums/role.enum';
import { JwtGuard } from 'src/common/Guard/access.guard';
import { Roles } from 'src/common/Decorator/Role.decorator';

@Controller('geofence')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Post('create')
  async addGeofence(@Body() creategeofencedto: createGeofenceDTO, @Req() req) {
    try {
      const result = await this.geofenceService.addGeofence(
        creategeofencedto,
        req,
      );
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

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

  @UseGuards(JwtGuard)
  @Roles(Role.User)
  @Get()
  async getHello() {
    return console.log('I am from protected route!!!');
  }
}
