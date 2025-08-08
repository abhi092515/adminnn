import { Router } from 'express';
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress
} from '../controllers/address.controller';

const router = Router();

// Route to create a new address
router.post('/', createAddress);

// Route to get all addresses for a specific user
router.get('/user/:userId', getUserAddresses);

// Routes to get, update, and delete a specific address by its ID
router.route('/:id')
  .get(getAddressById)
  .put(updateAddress)
  .delete(deleteAddress);

export default router;