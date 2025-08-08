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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReference = void 0;
const mongoose_1 = require("mongoose");
/**
 * Helper function to validate if a referenced ID is valid and exists in the database
 * @param model - The Mongoose model to query
 * @param id - The ObjectId to validate
 * @param modelName - Name of the model for error messages
 * @param res - Express response object
 * @returns Promise<boolean> - Returns true if valid and exists, false otherwise
 */
const validateReference = (model, id, modelName, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            state: 400,
            message: `Invalid ${modelName} ID format.`,
            data: null
        });
        return false;
    }
    const exists = yield model.findById(id);
    if (!exists) {
        res.status(404).json({
            state: 404,
            message: `${modelName} not found.`,
            data: null
        });
        return false;
    }
    return true;
});
exports.validateReference = validateReference;
