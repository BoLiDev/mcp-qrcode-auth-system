import {
  CreateSessionOptions,
  QRCodeGenerationOptions,
  QRCodeResult,
} from '@src/models';
import { createQRCodeForSession } from '@src/utils';

import { sessionService } from './session';

class QRCodeService {
  async generateQRCode(
    sessionOptions: CreateSessionOptions = {},
    qrOptions: QRCodeGenerationOptions = {}
  ): Promise<QRCodeResult> {
    const session = await sessionService.createSession(sessionOptions);
    const { qrcode, scanUrl } = await createQRCodeForSession(
      session.id,
      qrOptions
    );

    return {
      qrcode,
      scanUrl,
      sessionId: session.id,
      expiresAt: session.expiresAt,
    };
  }

  buildScanUrl(sessionId: string, baseUrl?: string): string {
    const base = baseUrl || 'http://localhost:3000';
    return `${base}/api/auth/scan/${sessionId}`;
  }
}

export const qrcodeService = new QRCodeService();
