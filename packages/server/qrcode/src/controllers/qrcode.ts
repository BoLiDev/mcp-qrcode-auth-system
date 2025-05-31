import { qrcodeService, sessionService } from '@src/services';
import {
  printError,
  printQRCodeGeneration,
  printStatusQuery,
} from '@src/utils';
import { Request, Response } from 'express';

interface StatusResponse {
  status: string;
  expiresAt: number;
  token?: string;
}

const handleQRCodeGeneration = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await qrcodeService.generateQRCode();
    printQRCodeGeneration();

    res.status(200).json({
      success: true,
      data: {
        sessionId: result.sessionId,
        qrcode: result.qrcode,
        scanUrl: result.scanUrl,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    printError('QR code generation', errorMessage);

    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code',
      message: errorMessage,
    });
  }
};

const handleStatusQuery = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;

  try {
    if (!sessionId) {
      printError('Status query', 'Session ID is required');
      res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
      return;
    }

    const session = await sessionService.getSession(sessionId);

    if (!session) {
      printError(
        'Status query',
        `Session ${sessionId.slice(0, 8)}... not found or expired`
      );
      res.status(404).json({
        success: false,
        error: 'Session not found or expired',
      });
      return;
    }

    printStatusQuery(sessionId, session.status);

    const responseData: StatusResponse = {
      status: session.status,
      expiresAt: session.expiresAt,
    };

    // Only include token if session is authenticated
    if (session.status === 'authenticated' && session.tokenId) {
      responseData.token = session.tokenId;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    printError('Status query', errorMessage);

    res.status(500).json({
      success: false,
      error: 'Failed to query session status',
      message: errorMessage,
    });
  }
};

export { handleQRCodeGeneration, handleStatusQuery };
