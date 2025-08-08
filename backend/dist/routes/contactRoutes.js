"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
const validate_1 = __importDefault(require("../middleware/validate"));
const contactSchema_1 = require("../schemas/contactSchema");
const router = (0, express_1.Router)();
// Apply the validation middleware to the POST route
router.post('/contacts', (0, validate_1.default)(contactSchema_1.contactSchema), contactController_1.createContact);
// No validation needed for GET requests
router.get('/contacts', contactController_1.getAllContacts);
router.get('/contacts/:id', contactController_1.getContactById);
// Apply the validation middleware to the PUT route
router.put('/contacts/:id', (0, validate_1.default)(contactSchema_1.contactSchema), contactController_1.updateContact);
// No validation needed for DELETE request
router.delete('/contacts/:id', contactController_1.deleteContact);
exports.default = router;
