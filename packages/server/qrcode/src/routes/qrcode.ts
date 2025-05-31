import { handleQRCodeGeneration, handleStatusQuery } from '@src/controllers';
import { Router } from 'express';

const router = Router();

router.get('/', handleQRCodeGeneration);
router.get('/status/:sessionId', handleStatusQuery);

export default router;
