import { handleScanAuthentication } from '@src/controllers';
import { Router } from 'express';

const router = Router();

router.post('/scan/:sessionId', handleScanAuthentication);

export default router;
