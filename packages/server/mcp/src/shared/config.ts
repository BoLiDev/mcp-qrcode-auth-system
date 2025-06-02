import { Config } from './types';

export const createSharedConfig = (): Config => ({
  proxyServer: {
    baseUrl: 'http://localhost:3100',
    timeout: 30000,
  },
  tokenServer: {
    port: 8070,
    callbackUrl: 'http://localhost:8070/auth/callback',
  },
  externalServices: {
    qrCodeUrl: 'http://localhost:5173',
    authServiceUrl: 'http://localhost:3000',
  },
  storage: {
    accountName: 'okfe',
    service: 'mcp-auth',
  },
});
