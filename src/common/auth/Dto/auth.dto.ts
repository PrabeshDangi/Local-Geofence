import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';

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

  @IsOptional()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsEnum(deviceType)
  deviceType: deviceType;

  @IsOptional()
  @IsString()
  deviceToken: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100, { message: 'password must be of minimum length 6' })
  newPassword: string;
}

export class SignupDto {
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100, { message: 'password must be of minimum length 6' })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class UpdateUserLocationDto {
  @IsNumber()
  @IsNotEmpty()
  long: number;

  @IsNumber()
  @IsNotEmpty()
  lat: number;
}

export class UpdateDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
