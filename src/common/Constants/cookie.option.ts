import { CookieOptions } from 'express';

export const accessTokenOption: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 54000,
};

export const refreshTokenOption: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'none',
  maxAge: 36288000,
  path: process.env.REFTOKEN_PATH,
};
