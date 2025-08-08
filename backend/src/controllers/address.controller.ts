import { Request, Response } from 'express';
import Address from '../models/address.model';

// Helper function to handle async logic and errors cleanly
const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return (req: Request, res: Response) => {
    fn(req, res).catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'An internal server error occurred', error: error.message });
    });
  };
};

export const createAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const newAddress = await Address.create(req.body);
  res.status(201).json(newAddress);
});

export const getUserAddresses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const addresses = await Address.find({ user: req.params.userId });
  if (!addresses || addresses.length === 0) {
    res.status(404).json({ message: 'No addresses found for this user' });
    return; // Use bare return for early exit
  }
  res.status(200).json(addresses);
});

export const getAddressById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const address = await Address.findById(req.params.id);
  if (!address) {
    res.status(404).json({ message: 'Address not found' });
    return; // Use bare return for early exit
  }
  res.status(200).json(address);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedAddress) {
    res.status(404).json({ message: 'Address not found' });
    return; // Use bare return for early exit
  }
  res.status(200).json(updatedAddress);
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const address = await Address.findByIdAndDelete(req.params.id);
  if (!address) {
    res.status(404).json({ message: 'Address not found' });
    return; // Use bare return for early exit
  }
  res.status(204).send();
});