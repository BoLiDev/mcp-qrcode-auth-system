import { handleTokenRevocation, handleTokenValidation } from '@src/controllers';
import { authenticateToken } from '@src/middleware';
import { Router } from 'express';

const router = Router();

router.get('/validate', authenticateToken, handleTokenValidation);
router.post('/revoke', authenticateToken, handleTokenRevocation);

export default router;
