import express from 'express';
import {
  assignPdfToCourse,
  getPdfsForCourse,
  getCoursesForPdf,
  updatePdfPriority,
  reorderPdfs,
  removePdfFromCourse,
  togglePdfStatus,
  // getAssignedPdfsForCourse,
  getAssignedPdfsForCourseV2,
  getAvailablePdfsForCourse
} from '../controllers/coursePdfController';

const router = express.Router();

// Course-PDF assignment routes
router.post('/courses/:courseId/pdfs', assignPdfToCourse);
 router.get('/courses/:courseId/pdfs', getPdfsForCourse);
// router.get('/courses/:courseId/assigned-pdfs', getAssignedPdfsForCourse);
router.put('/courses/:courseId/pdfs/reorder', reorderPdfs);
router.put('/courses/:courseId/pdfs/:pdfId/priority', updatePdfPriority);
router.patch('/courses/:courseId/pdfs/:pdfId/toggle-status', togglePdfStatus);
router.delete('/courses/:courseId/pdfs/:pdfId', removePdfFromCourse);
router.get('/courses/:courseId/assigned-pdfs', getAssignedPdfsForCourseV2);
router.get('/courses/:courseId/available-pdfs', getAvailablePdfsForCourse)

// PDF-Course lookup routes
router.get('/pdfs/:pdfId/courses', getCoursesForPdf);

export default router;
