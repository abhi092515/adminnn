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
import { Router } from 'express';
import {
  createPdf,
  getPdfs,
  getPdfById,
  updatePdf,
  deletePdf,
} from '../controllers/pdfController';
import configureMulter from '../config/multerConfig';

const router = Router();

const upload = configureMulter('pdfs'); 

// --- Routes for /api/pdfs ---
router.route('/')
  .post(
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'uploadPdf', maxCount: 1 }
    ]),
    createPdf
  )
  .get(getPdfs);

// --- Routes for /api/pdfs/:id ---
router.route('/:id')
  .get(getPdfById)
  // ✅ ADD THE SAME MIDDLEWARE HERE FOR UPDATES
  .put(
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'uploadPdf', maxCount: 1 }
    ]),
    updatePdf
  )
  .delete(deletePdf);

export default router;