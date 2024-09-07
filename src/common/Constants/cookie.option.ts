import { CookieOptions } from 'express';

export const accessTokenOption: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: parseInt(process.env.ACCTOKEN_TTL),
};

export const refreshTokenoption: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'none',
  maxAge: parseInt(process.env.REFTOKEN_TTL),
  path: process.env.REFTOKEN_PATH,
};
