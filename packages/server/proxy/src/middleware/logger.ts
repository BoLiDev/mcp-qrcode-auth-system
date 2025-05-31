import { ResponseHelper } from '@src/utils';
import { NextFunction, Request, Response } from 'express';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log('request', ResponseHelper.formatLogMessage(req.method, req.url));

  res.on('finish', () => {
    console.log(
      'response',
      ResponseHelper.formatLogMessage(req.method, req.url, res.statusCode)
    );
  });

  next();
}
