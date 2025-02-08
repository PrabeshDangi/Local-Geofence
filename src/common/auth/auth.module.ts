import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from './Strategies/at.strategies';
import { RtStrategy } from './Strategies/rt.strategies';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { EmailModule } from 'src/global/email/email.module';
import { EmailService } from 'src/global/email/email.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.ACCESS_SECRET,
      signOptions: { expiresIn: process.env.ACCTOKEN_TTL },
    }),
    JwtModule.register({
      secret: process.env.REFRESH_SECRET,
      signOptions: { expiresIn: process.env.REFTOKEN_TTL },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, PrismaService, EmailService],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
