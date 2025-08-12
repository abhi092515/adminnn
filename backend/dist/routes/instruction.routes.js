"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const instruction_controller_1 = require("../controllers/instruction.controller");
// You can add your Zod validation middleware here if you have it
const router = (0, express_1.Router)();
// Route to get all instructions and create a new one
router.route('/')
    .get(instruction_controller_1.getAllInstructions)
    .post(instruction_controller_1.createInstruction);
// Routes to get, update, and delete a specific instruction by its ID
router.route('/:id')
    .get(instruction_controller_1.getInstructionById)
    .put(instruction_controller_1.updateInstruction)
    .delete(instruction_controller_1.deleteInstruction);
exports.default = router;
