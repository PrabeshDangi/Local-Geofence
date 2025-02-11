import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AppService {
  getHello(res:Response): void {  
    res.send({
        message:"Welcome to our Local geofence backend server📡📡"
    });
  }
}