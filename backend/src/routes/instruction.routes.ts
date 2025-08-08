import { Router } from 'express';
import {
    createInstruction,
    getAllInstructions,
    getInstructionById, // Make sure to export this from your controller
    updateInstruction,
    deleteInstruction
} from '../controllers/instruction.controller';
// You can add your Zod validation middleware here if you have it

const router = Router();

// Route to get all instructions and create a new one
router.route('/')
    .get(getAllInstructions)
    .post(createInstruction);

// Routes to get, update, and delete a specific instruction by its ID
router.route('/:id')
    .get(getInstructionById)
    .put(updateInstruction)
    .delete(deleteInstruction);

export default router;