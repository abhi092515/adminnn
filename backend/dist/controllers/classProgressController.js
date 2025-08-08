"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClassProgress = exports.getClassProgress = void 0;
const mongoose_1 = require("mongoose");
const ClassProgress_1 = __importDefault(require("../models/ClassProgress"));
const dateUtils_1 = require("../utils/dateUtils");
const getClassProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield ClassProgress_1.default.find();
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching class progress', error });
    }
});
exports.getClassProgress = getClassProgress;
const createClassProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, classId, courseId, userStartTime, userEndTime } = req.body;
        const startTime = (0, dateUtils_1.convertToDate)(userStartTime);
        const endTime = (0, dateUtils_1.convertToDate)(userEndTime); // Validate that the dates are valid
        if (!(0, dateUtils_1.isValidDate)(startTime) || !(0, dateUtils_1.isValidDate)(endTime)) {
            res.status(400).json({
                message: 'Invalid date format. Please provide valid timestamps (10 or 13 digits) or ISO date strings.',
                examples: {
                    unix_seconds: 1733270400,
                    unix_milliseconds: 1733270400000,
                    iso_string: "2024-12-04T10:00:00.000Z"
                }
            });
            return;
        }
        // Validate courseId format
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({
                message: 'Invalid courseId format. Must be a valid ObjectId.'
            });
            return;
        }
        const newProgress = new ClassProgress_1.default({
            userId,
            classId,
            courseId: new mongoose_1.Types.ObjectId(courseId),
            userStartTime: startTime,
            userEndTime: endTime
        });
        const savedProgress = yield newProgress.save();
        res.status(201).json(savedProgress);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating class progress', error });
    }
});
exports.createClassProgress = createClassProgress;
