import { Router } from 'express';
import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    getSubscriptionFormData,
} from '../controllers/subscription.controller';
// REMOVED: Validation imports are no longer needed
// import { validate } from '../middleware/validate';
// import { createSubscriptionSchema, updateSubscriptionSchema } from '../validations/subscription.validation';

const router = Router();

router.route('/')
    // REMOVED: validate() middleware
    .post(createSubscription)
    .get(getAllSubscriptions);

// This special route for form data must come before the /:id route
router.get('/form-data', getSubscriptionFormData);

router.route('/:id')
    .get(getSubscriptionById)
    // REMOVED: validate() middleware
    .put(updateSubscription)
    .delete(deleteSubscription);

export default router;