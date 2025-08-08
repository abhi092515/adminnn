import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contactController';
import validate from '../middleware/validate';
import { contactSchema } from '../schemas/contactSchema';

const router = Router();

// Apply the validation middleware to the POST route
router.post('/contacts', validate(contactSchema), createContact);

// No validation needed for GET requests
router.get('/contacts', getAllContacts);
router.get('/contacts/:id', getContactById);

// Apply the validation middleware to the PUT route
router.put('/contacts/:id', validate(contactSchema), updateContact);

// No validation needed for DELETE request
router.delete('/contacts/:id', deleteContact);

export default router;