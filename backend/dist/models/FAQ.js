"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQItemSchema = void 0;
const mongoose_1 = require("mongoose");
exports.FAQItemSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});
