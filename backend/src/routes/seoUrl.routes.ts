// src/routes/seoUrl.routes.ts

import { Router } from 'express';
import * as seoUrlController from '../controllers/seoUrl.controller';

const router = Router();

// To get a list of URLs.
// CORRECT: All handlers are prefixed with 'seoUrlController.'
router.post('/list', seoUrlController.getAllSeoUrls);

// To create a new URL.
router.post('/', seoUrlController.createSeoUrl);

// To update a URL. This was the source of the first error.
router.route('/:id')
    .get(seoUrlController.getSeoUrlById)      // ✅ ADDED: The new route for fetching data
    .put(seoUrlController.updateSeoUrl)      // For updating
    .delete(seoUrlController.deleteSeoUrl);

// To partially update a URL's priority.
router.patch('/:id/priority', seoUrlController.updatePriority);


export default router;