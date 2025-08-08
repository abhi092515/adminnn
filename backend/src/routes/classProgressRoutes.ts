import { Router } from 'express';
import { getClassProgress, createClassProgress } from '../controllers/classProgressController';

const router = Router();

router.get('/', getClassProgress);
router.post('/', createClassProgress);

export default router;
