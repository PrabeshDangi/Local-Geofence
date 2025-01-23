import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  accessTokenOption,
  refreshTokenOption,
} from 'src/common/Constants/cookie.option';
import { RtGuard } from 'src/common/Guard/rt.guard';
import { JwtGuard } from 'src/common/Guard/access.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './Dto/login.dto';
import { Tokens } from './Types/index';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async singinLocal(@Body() logindto: LoginDto, @Res() res): Promise<Tokens> {
    try {
      const { accessToken, refreshToken, role } =
        await this.authService.SigninUser(logindto, res);
      return res
        .cookie('access_token', accessToken)
        .cookie('refresh_token', refreshToken)
        .json({
          success: true,
          message: 'Login successful',
          data: {
            accessToken,
            refreshToken,
            role,
          },
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
  @Post('verify-email')
  async verifyEmail(@Query('token') token: string, @Req() req, @Res() res) {
    return this.authService.verifyEmail(token, req, res);
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
