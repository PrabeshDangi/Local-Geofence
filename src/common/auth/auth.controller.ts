import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import {
  accessTokenOption,
  refreshTokenOption,
} from 'src/common/Constants/cookie.option';
import { HttpResponse } from 'src/common/utils/http-response.util';
import { RtGuard } from 'src/common/Guard/refresh.guard';
import { JwtGuard } from 'src/common/Guard/access.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './Dto/login.dto';
import { SignupDto } from './Dto/register.dto';
import { Tokens } from './Types/index';
import { Public } from 'src/common/Decorator/Public.decorator';
import { ChangePasswordDto } from './Dto/changePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(200)
  @UsePipes()
  async signup(@Body() signupdata: SignupDto): Promise<HttpResponse> {
    try {
      const data = await this.authService.SignupUser(signupdata);

      return new HttpResponse({
        message: 'User successfully signed up!!',
        data,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async singin(@Body() logindto: LoginDto, @Res() res): Promise<Tokens> {
    try {
      const { accessToken, refreshToken, userAvailable } =
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
            user: userAvailable,
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
  @Post('token-refresh')
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

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async getProfile(@Req() req): Promise<HttpResponse> {
    try {
      const user = await this.authService.getProfile(req.user.id);

      return new HttpResponse({
        message: 'Profile fetched successfully!!',
        data: user,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Req() req,
    @Body() changepassworddto: ChangePasswordDto,
  ) {
    const response = await this.authService.changePassword(
      req.user.id,
      changepassworddto,
    );
    return new HttpResponse({
      message: 'Password changed successfully!!',
      data: response,
    });
  }
}
