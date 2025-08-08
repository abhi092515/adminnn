import { Request, Response } from 'express';
import Contact, { IContact } from '../models/contact';

// Create a new contact
export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json({
      success: true,
      data: newContact,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

// Get all contacts
export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contacts: IContact[] = await Contact.find();
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

// Get a single contact by ID
export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact: IContact | null = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

// Update a contact by ID
export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact: IContact | null = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contact) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

// Delete a contact by ID
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact: IContact | null = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};