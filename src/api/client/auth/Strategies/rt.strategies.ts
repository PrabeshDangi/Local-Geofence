import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  private static extractJWT(req: Request): string | null {
    const tokenFromCookie = req.cookies?.Refresh_Token;
    const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!(tokenFromCookie || tokenFromHeader)) {
      return null;
    }
    // console.log(tokenFromCookie);
    // console.log('J payo tei');
    // console.log(tokenFromHeader);

    return tokenFromCookie || tokenFromHeader;
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    //console.log(payload);
    return payload;
  }
}
