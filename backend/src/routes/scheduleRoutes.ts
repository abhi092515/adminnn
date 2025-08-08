import express from 'express';
import { getBatchSchedule } from '../controllers/scheduleController';

const router = express.Router();

// Route for POST /api/schedules/batch
router.route('/batch').post(getBatchSchedule);

export default router;