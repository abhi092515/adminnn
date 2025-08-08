// src/utils/dbHelpers.ts
import { Response } from 'express';
import { Types } from 'mongoose';

/**
 * Helper function to validate if a referenced ID is valid and exists in the database
 * @param model - The Mongoose model to query
 * @param id - The ObjectId to validate
 * @param modelName - Name of the model for error messages
 * @param res - Express response object
 * @returns Promise<boolean> - Returns true if valid and exists, false otherwise
 */
export const validateReference = async (
  model: any,
  id: string | Types.ObjectId,
  modelName: string,
  res: Response
): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({
      state: 400,
      message: `Invalid ${modelName} ID format.`,
      data: null
    });
    return false;
  }
  
  const exists = await model.findById(id);
  if (!exists) {
    res.status(404).json({
      state: 404,
      message: `${modelName} not found.`,
      data: null
    });
    return false;
  }
  
  return true;
};
