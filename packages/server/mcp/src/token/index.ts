import { createSharedConfig } from '../shared';
import { TokenServer } from './token-server';

export const createTokenServer = (): TokenServer => {
  const config = createSharedConfig();
  return new TokenServer(config);
};

export const runTokenServer = async (): Promise<void> => {
  try {
    const tokenServer = createTokenServer();
    await tokenServer.start();

    process.on('SIGINT', async () => {
      console.error('\nShutting down token server...');
      await tokenServer.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start token server:', error);
    process.exit(1);
  }
};
