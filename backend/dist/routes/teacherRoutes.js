"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/teacherRoutes.ts
const express_1 = __importDefault(require("express"));
const teacherController_1 = require("../controllers/teacherController");
const router = express_1.default.Router();
// CRUD routes for Teachers
router.post('/', teacherController_1.createTeacher);
router.get('/', teacherController_1.getTeachers);
router.get('/:id', teacherController_1.getTeacherById);
router.put('/:id', teacherController_1.updateTeacher);
router.delete('/:id', teacherController_1.deleteTeacher);
exports.default = router;
