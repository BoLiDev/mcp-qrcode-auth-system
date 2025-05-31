import { GitLabController } from '@src/controllers';
import { type IRouter, Router } from 'express';

const router: IRouter = Router();

router.all('/gitlab/{*any}', GitLabController.proxyRequest);

export default router;
