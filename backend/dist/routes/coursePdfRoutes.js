"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coursePdfController_1 = require("../controllers/coursePdfController");
const router = express_1.default.Router();
// Course-PDF assignment routes
router.post('/courses/:courseId/pdfs', coursePdfController_1.assignPdfToCourse);
router.get('/courses/:courseId/pdfs', coursePdfController_1.getPdfsForCourse);
// router.get('/courses/:courseId/assigned-pdfs', getAssignedPdfsForCourse);
router.put('/courses/:courseId/pdfs/reorder', coursePdfController_1.reorderPdfs);
router.put('/courses/:courseId/pdfs/:pdfId/priority', coursePdfController_1.updatePdfPriority);
router.patch('/courses/:courseId/pdfs/:pdfId/toggle-status', coursePdfController_1.togglePdfStatus);
router.delete('/courses/:courseId/pdfs/:pdfId', coursePdfController_1.removePdfFromCourse);
router.get('/courses/:courseId/assigned-pdfs', coursePdfController_1.getAssignedPdfsForCourseV2);
router.get('/courses/:courseId/available-pdfs', coursePdfController_1.getAvailablePdfsForCourse);
// PDF-Course lookup routes
router.get('/pdfs/:pdfId/courses', coursePdfController_1.getCoursesForPdf);
exports.default = router;
