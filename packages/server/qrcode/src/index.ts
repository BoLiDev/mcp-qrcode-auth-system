import createApp from './app';

const startServer = (): void => {
  const app = createApp();
  const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;

  app.listen(port, () => {
    console.log(`🚀 QR Code Auth Server is running on port ${port}`);
    console.log(`🌐 Health check: http://localhost:${port}/health`);
    console.log(`📱 QR Code API: http://localhost:${port}/api/qrcode`);
  });
};

startServer();
