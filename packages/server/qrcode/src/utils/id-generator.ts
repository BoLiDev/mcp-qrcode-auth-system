import { randomBytes } from 'crypto';

export const generateSessionId = (): string => {
  return randomBytes(16).toString('hex');
};

export const generateTokenId = (): string => {
  return randomBytes(32).toString('hex');
};

export const generateUserId = (): string => {
  return `user_${randomBytes(8).toString('hex')}`;
};
