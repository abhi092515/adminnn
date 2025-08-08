"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
// REMOVED: Validation imports are no longer needed
// import { validate } from '../middleware/validate';
// import { createSubscriptionSchema, updateSubscriptionSchema } from '../validations/subscription.validation';
const router = (0, express_1.Router)();
router.route('/')
    // REMOVED: validate() middleware
    .post(subscription_controller_1.createSubscription)
    .get(subscription_controller_1.getAllSubscriptions);
// This special route for form data must come before the /:id route
router.get('/form-data', subscription_controller_1.getSubscriptionFormData);
router.route('/:id')
    .get(subscription_controller_1.getSubscriptionById)
    // REMOVED: validate() middleware
    .put(subscription_controller_1.updateSubscription)
    .delete(subscription_controller_1.deleteSubscription);
exports.default = router;
