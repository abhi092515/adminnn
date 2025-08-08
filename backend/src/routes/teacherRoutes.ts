// src/routes/teacherRoutes.ts
import express from 'express';
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController';

const router = express.Router();

// CRUD routes for Teachers
router.post('/', createTeacher);
router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

export default router;