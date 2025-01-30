import { IsString, IsEmail, IsNotEmpty, Length, IsEnum } from 'class-validator';

import { deviceType } from '@prisma/client';

export class LoginDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100, { message: 'password must be of minimum length 6' })
  password: string;

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsEnum(deviceType)
  deviceType: deviceType;

  @IsNotEmpty()
  @IsString()
  deviceToken: string;
}
