import { handleScanAuthentication } from '@src/controllers';
import { type IRouter, Router } from 'express';

const router: IRouter = Router();

router.post('/scan/:sessionId', handleScanAuthentication);

export default router;
