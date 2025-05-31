import { QRCodeGenerationOptions } from '@src/models';
import QRCode from 'qrcode';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_QR_SIZE = 256;
const DEFAULT_ERROR_CORRECTION = 'M' as const;

export const buildScanUrl = (sessionId: string, baseUrl?: string): string => {
  const base = baseUrl || DEFAULT_BASE_URL;
  return `${base}/api/auth/scan/${sessionId}`;
};

export const generateQRCodeImage = async (
  url: string,
  options: QRCodeGenerationOptions = {}
): Promise<string> => {
  const qrOptions = {
    width: options.size || DEFAULT_QR_SIZE,
    errorCorrectionLevel:
      options.errorCorrectionLevel || DEFAULT_ERROR_CORRECTION,
  };

  try {
    return await QRCode.toDataURL(url, qrOptions);
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const createQRCodeForSession = async (
  sessionId: string,
  options: QRCodeGenerationOptions = {}
): Promise<{ qrcode: string; scanUrl: string }> => {
  const scanUrl = buildScanUrl(sessionId, options.baseUrl);
  const qrcode = await generateQRCodeImage(scanUrl, options);

  return { qrcode, scanUrl };
};
