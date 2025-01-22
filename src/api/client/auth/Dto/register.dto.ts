import { Role } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  role?: Role;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100, { message: 'password must be of minimum length 6' })
  password: string;
}
