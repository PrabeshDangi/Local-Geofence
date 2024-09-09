import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { registerDTO } from './Dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './Types/tokens.types';
import { JwtPayload } from './Types/jwtpayload.types';
import { LoginDTO } from './Dto/login.dto';
import { Response, Request } from 'express';
import {
  accessTokenOption,
  refreshTokenOption,
} from '../../common/Constants/cookie.option';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signupLocal(signupdto: registerDTO) {
    const { name, email, password, role } = signupdto;

    const emailAvailable = await this.prisma.user.findUnique({
      where: { email },
    });

    if (emailAvailable) {
      throw new ConflictException('User with email already exists!!');
    }

    const hashPassword = await this.hashData(password);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role: role || 'user',
      },
    });

    return newUser;
  }

  async singinLocal(logindto: LoginDTO, res: Response): Promise<Tokens> {
    const { email, password } = logindto;
    const userAvailable = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userAvailable) {
      throw new NotFoundException('User not registered!!');
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userAvailable.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('Invalid credentials!!');
    }

    const { access_token, refresh_token } = await this.getTokens(
      userAvailable.id,
      email,
    );
    res
      .cookie('access_token', access_token, accessTokenOption)
      .cookie('refresh_token', refresh_token, refreshTokenOption);

    return { access_token, refresh_token };
  }

  async logout(res: Response): Promise<Boolean> {
    try {
      res
        .clearCookie('access_token', accessTokenOption)
        .clearCookie('refresh_token', refreshTokenOption);

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async refreshToken(req: Request): Promise<Tokens> {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const payload = this.verifyRefreshToken(refreshToken);

    // Check if the refresh token is about to expire
    const isExpiringSoon = this.isTokenExpiringSoon(payload.exp);

    let access_token: string;
    let refresh_token: string | null = null;

    if (isExpiringSoon) {
      const { access_token, refresh_token } = await this.getTokens(
        payload.id,
        payload.email,
      );
    } else {
      access_token = await this.generateAccessToken(
        payload.userId,
        payload.email,
      );
    }

    return {
      access_token,
      refresh_token,
    };
  }

  private async hashData(data: string): Promise<string> {
    return await bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(jwtPayload, {
        secret: process.env.ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(jwtPayload, {
        secret: process.env.REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  private verifyRefreshToken(token: string): any {
    try {
      return this.jwt.verify(token, { secret: process.env.REFRESH_SECRET });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private isTokenExpiringSoon(expiration: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return expiration - currentTime < 86400;
  }

  private async generateAccessToken(
    userId: number,
    email: string,
  ): Promise<string> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    return this.jwt.signAsync(
      this.jwt.signAsync(jwtPayload, {
        secret: process.env.ACCESS_SECRET,
        expiresIn: '15m',
      }),
    );
  }
}
