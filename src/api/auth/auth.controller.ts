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
import { User } from '@prisma/client';
import { Response } from 'express';
import {
  accessTokenOption,
  refreshTokenOption,
} from 'src/common/Constants/cookie.option';
import { RtGuard } from 'src/common/Guard/rt.guard';
import { JwtGuard } from '../../common/Guard/access.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './Dto/login.dto';
import { SignupDto } from './Dto/register.dto';
import { Tokens } from './Types/index';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('local/signup')
  async signupLocal(@Body() signupdto: SignupDto, @Res() res): Promise<User> {
    try {
      const response = await this.authService.SignupUser(signupdto, res);

      return res.json({
        message: 'User created successfully',
        response,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('local/login')
  async singinLocal(@Body() logindto: LoginDto, @Res() res): Promise<Tokens> {
    try {
      const { accessToken, refreshToken } = await this.authService.SigninUser(
        logindto,
        res,
      );
      return res
        .cookie('access_token', accessToken)
        .cookie('refresh_token', refreshToken)
        .json({
          message: 'Login successful',
          accessToken,
          refreshToken,
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      await this.authService.SignoutUser(res);
      return res.json({
        message: 'User logged out successfully!',
        success: true,
      });
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @Post('/token-refresh')
  async refreshToken(@Req() req, @Res() res) {
    const tokens = await this.authService.refreshToken(req);

    res
      .cookie('refresh_token', tokens.refreshToken, refreshTokenOption)
      .cookie('access_token', tokens.accessToken, accessTokenOption)
      .json({
        message: 'Token refreshed successfully!!',
        refreshtoken: tokens.refreshToken,
        accesstoken: tokens.accessToken,
      });
  }
}
