import { handleQRCodeGeneration, handleStatusQuery } from '@src/controllers';
import { type IRouter, Router } from 'express';

const router: IRouter = Router();

router.get('/', handleQRCodeGeneration);
router.get('/status/:sessionId', handleStatusQuery);

export default router;
