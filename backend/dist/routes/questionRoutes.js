"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/courseRoutes.ts
const express_1 = __importDefault(require("express"));
const questionController_1 = require("../controllers/questionController");
const router = express_1.default.Router();
// --- Public Routes ---
router.get('/', questionController_1.getQuestions);
router.post('/', questionController_1.createQuestion);
router.get('/:id', questionController_1.getQuestionById);
router.put('/:id', questionController_1.updateQuestion);
router.put('/:id/status', questionController_1.updateQuestionStatus);
router.delete('/:id', questionController_1.deleteQuestion);
exports.default = router;
