import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { ChangePasswordDto, LoginDto, SignupDto } from './Dto/login.dto';
import { EmailService } from 'src/global/email/email.service';
import { Request, Response } from 'express';
import {
  buildErrorTemplate,
  buildSuccessTemplate,
} from 'src/global/email/Templates/emailVerification.template';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
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

    const verificationToken = await this.generateEmailVerificationToken(
      newuser.email,
    );

    await this.emailService.sendVerificationEmail(
      newuser.email,
      verificationToken,
    );

    return;
  }

  async SigninUser(signindto: LoginDto, res: Response) {
    const { email, password } = signindto;

    const userAvailable = await this.prisma.user.findUnique({
      where: {
        email,
        //isEmailVerified: true
      },
    });

    if (!userAvailable) {
      throw new BadRequestException(
        'This email is probably not registered or verified!!',
      );
    }

    const isPasswordCorrect = await this.checkPassword(
      password,
      userAvailable.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.signTokens({
      id: userAvailable.id,
      name: userAvailable.name,
      role: userAvailable.role,
    });

    await this.prisma.user.update({
      where: { id: userAvailable.id },
      data: {
        deviceId: signindto.deviceId,
        deviceType: signindto.deviceType,
        deviceToken: signindto.deviceToken,
      },
    });

    return {
      accessToken,
      refreshToken,
      userAvailable
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

  async verifyEmail(token: string, req: Request, res: Response) {
    if (!token) {
      throw new BadRequestException('Token not found!!');
    }

    try {
      const decodedInfo = await this.jwt.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { email: decodedInfo.email },
      });

      if (!user) {
        throw new BadRequestException('User not found!!');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
        },
      });

      const successMessage = await buildSuccessTemplate();
      res.send(successMessage);

      res.json({
        success: true,
        message: 'Email verified successfully!!',
      });
    } catch (error) {
      const errorMessage = await buildErrorTemplate();
      res.send(errorMessage);
      throw new BadRequestException('Invalid or expired verification token!!');
    }
  }

  async refreshToken(token:string) {
   

    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const decodedToken = await this.jwt.verify(token, {
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

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found!!');
    }

    return user;
  }

  async changePassword(id: number, changepassworddto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changepassworddto;

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not found!!');
    }

    const isPasswordCorrect = await this.checkPassword(
      oldPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('Old password is incorrect!!');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
      },
    });
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

  private async generateEmailVerificationToken(email: string) {
    return this.jwt.sign(
      { email },
      { secret: process.env.JWT_SECRET, expiresIn: '5m' },
    );
  }
}
