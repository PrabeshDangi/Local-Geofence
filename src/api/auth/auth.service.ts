import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { registerDTO } from './Dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './Types/tokens.types';
import { JwtPayload } from './Types/jwtpayload.types';
import { LoginDTO } from './Dto/login.dto';
import { Response } from 'express';
import {
  accessTokenOption,
  refreshTokenoption,
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

    const isPasswordCorrect = bcrypt.compare(password, userAvailable.password);

    if (!isPasswordCorrect) {
      throw new BadRequestException('Invalid credentials!!');
    }

    const { access_token, refresh_token } = await this.getTokens(
      userAvailable.id,
      email,
    );

    res
      .cookie('access_token', access_token, accessTokenOption)
      .cookie('refresh_token', refresh_token, refreshTokenoption);

    return { access_token, refresh_token };
  }

  async logout(res: Response): Promise<Boolean> {
    try {
      res
        .clearCookie('access_token', accessTokenOption)
        .clearCookie('refresh_token', refreshTokenoption);

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }
  refreshToken() {}

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
}
