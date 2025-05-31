import { HealthController } from '@src/controllers';
import { type IRouter, Router } from 'express';

const router: IRouter = Router();

router.get('/health', HealthController.getHealth);
router.get('/', HealthController.getServiceInfo);

export default router;
