import { GitLabController } from '@src/controllers';
import { Router } from 'express';

const router = Router();

router.all('/gitlab/{*any}', GitLabController.proxyRequest);

export default router;
