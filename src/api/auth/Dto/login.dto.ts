import { IsString, IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100, { message: 'password must be of minimum length 6' })
  password: string;
}
