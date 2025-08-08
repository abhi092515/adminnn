"use strict";
// // src/routes/pdfRoutes.ts
// import { Router } from 'express';
// import {
//   createPdf,
//   getPdfs,
//   getPdfById,
//   updatePdf,
//   deletePdf,
// } from '../controllers/pdfController';
// import configureMulter from '../config/multerConfig';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = Router();
// // Routes for /api/pdfs
// router.route('/').post(
//   upload.fields([
//     { name: 'image', maxCount: 1 },
//     { name: 'uploadPdf', maxCount: 1 }
//   ]),
//   createPdf
// ).get(getPdfs);
// router.route('/').post(createPdf).get(getPdfs);
// // Routes for /api/pdfs/:id
// router.route('/:id').get(getPdfById).put(updatePdf).delete(deletePdf);
// export default router; 
const express_1 = require("express");
const pdfController_1 = require("../controllers/pdfController");
const multerConfig_1 = __importDefault(require("../config/multerConfig"));
const router = (0, express_1.Router)();
const upload = (0, multerConfig_1.default)('pdfs');
// --- Routes for /api/pdfs ---
router.route('/')
    .post(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'uploadPdf', maxCount: 1 }
]), pdfController_1.createPdf)
    .get(pdfController_1.getPdfs);
// --- Routes for /api/pdfs/:id ---
router.route('/:id')
    .get(pdfController_1.getPdfById)
    // ✅ ADD THE SAME MIDDLEWARE HERE FOR UPDATES
    .put(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'uploadPdf', maxCount: 1 }
]), pdfController_1.updatePdf)
    .delete(pdfController_1.deletePdf);
exports.default = router;
