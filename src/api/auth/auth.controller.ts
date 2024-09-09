import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDTO } from './Dto/register.dto';
import { User } from '@prisma/client';
import { LoginDTO } from './Dto/login.dto';
import { JwtGuard } from '../../common/Guard/Jwt.guard';
import { LogoutResponseType, Tokens } from './Types/index';
import { RtGuard } from 'src/common/Guard/rt.guard';
import { refreshTokenOption } from 'src/common/Constants/cookie.option';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('local/signup')
  signupLocal(@Body() signupdto: registerDTO): Promise<User> {
    try {
      return this.authService.signupLocal(signupdto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('local/login')
  async singinLocal(@Body() logindto: LoginDTO, @Res() res): Promise<Tokens> {
    try {
      const { access_token, refresh_token } =
        await this.authService.singinLocal(logindto, res);
      return res.json({
        message: 'Login successful',
        access_token,
        refresh_token,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res() res): Promise<LogoutResponseType> {
    try {
      await this.authService.logout(res);
      return res.json({
        message: 'User logged out successfully!',
        success: true,
      });
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  @UseGuards(RtGuard)
  @Post('/token-refresh')
  async refreshToken(@Req() req, @Res() res): Promise<Tokens> {
    const tokens = await this.authService.refreshToken(req);

    if (tokens?.refresh_token) {
      res.cookie('refresh_token', tokens.refresh_token, refreshTokenOption);
    }

    return res.json({ access_token: tokens.access_token });
  }
}
