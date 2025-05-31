import { handleTokenRevocation, handleTokenValidation } from '@src/controllers';
import { authenticateToken } from '@src/middleware';
import { type IRouter, Router } from 'express';

const router: IRouter = Router();

router.get('/validate', authenticateToken, handleTokenValidation);
router.post('/revoke', authenticateToken, handleTokenRevocation);

export default router;
