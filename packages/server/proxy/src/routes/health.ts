import { HealthController } from '@src/controllers';
import { Router } from 'express';

const router = Router();

router.get('/health', HealthController.getHealth);
router.get('/', HealthController.getServiceInfo);

export default router;
