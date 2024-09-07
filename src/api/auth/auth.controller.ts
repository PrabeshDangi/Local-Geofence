import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDTO } from './Dto/register.dto';
import { User } from '@prisma/client';
import { LoginDTO } from './Dto/login.dto';
import { JwtGuard } from '../../common/Guard/Jwt.guard';
import { LoginResponseType, LogoutResponseType } from './Types/index';

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
  async singinLocal(
    @Body() logindto: LoginDTO,
    @Res() res,
  ): Promise<LoginResponseType> {
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

  @Post('/token-refresh')
  refreshToken() {
    this.authService.refreshToken();
  }
}
