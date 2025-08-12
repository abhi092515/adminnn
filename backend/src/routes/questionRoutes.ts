// src/routes/courseRoutes.ts
import express from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  updateQuestionStatus,
} from '../controllers/questionController';

const router = express.Router();

// --- Public Routes ---
router.get('/', getQuestions);
router.post('/', createQuestion);

router.get('/:id', getQuestionById);

router.put('/:id', updateQuestion);
router.put('/:id/status', updateQuestionStatus);

router.delete('/:id', deleteQuestion);



export default router;