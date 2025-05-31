export interface QRCodeResult {
  qrcode: string;
  scanUrl: string;
  sessionId: string;
  expiresAt: number;
}

export interface QRCodeGenerationOptions {
  baseUrl?: string;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}
