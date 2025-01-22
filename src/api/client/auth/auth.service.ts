import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { LoginDto } from './Dto/login.dto';
import { SignupDto } from './Dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async SignupUser(signupdto: SignupDto) {
    const { name, email, password } = signupdto;

    const isUserAvailable = await this.prisma.user.findUnique({
      where: { email },
    });

    if (isUserAvailable) {
      throw new BadRequestException('Email already registered!!');
    }

    const hashedpassword = await this.hashPassword(password);

    const newuser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedpassword,
        role: 'user',
      },
    });

    return newuser;
  }

  async SigninUser(signindto: LoginDto, res: Response) {
    const { email, password } = signindto;

    const userAvailable = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userAvailable) {
      throw new BadRequestException('Email not registered!!');
    }

    const isPasswordCorrect = await this.checkPassword(
      password,
      userAvailable.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (userAvailable.role != 'user') {
      throw new UnauthorizedException('Permission denied!!');
    }

    const { accessToken, refreshToken } = await this.signTokens({
      id: userAvailable.id,
      name: userAvailable.name,
      role: userAvailable.role,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async SignoutUser(res) {
    try {
      res.clearCookie('token');
      return;
    } catch (error) {
      return res.json({
        message: 'Internal server error.',
      });
    }
  }

  async refreshToken(req) {
    const incomingrefreshToken = req.cookies.refresh_token;

    if (!incomingrefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const decodedToken = await this.jwt.verify(incomingrefreshToken, {
        secret: process.env.REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decodedToken.id },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token!!');
      }

      const { accessToken, refreshToken } = await this.signTokens({
        id: decodedToken.id,
        name: decodedToken.name,
        role: decodedToken.role,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Invalid token!!');
    }
  }

  private async hashPassword(password: string) {
    const saltRound = 10;
    return await bcrypt.hash(password, saltRound);
  }

  private async checkPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async signTokens(args: { id: number; name: string; role: string }) {
    const { id, name, role } = args;
    const accessToken = await this.generateAccessToken({ id, role });
    const refreshToken = await this.generateRefreshToken({ id, name });

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(payload: { id: number; role: string }) {
    return this.jwt.sign(payload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRY,
    });
  }

  private async generateRefreshToken(payload: { id: number; name: string }) {
    return this.jwt.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRY,
    });
  }
}
