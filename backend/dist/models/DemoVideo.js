"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoVideoSchema = void 0;
const mongoose_1 = require("mongoose");
exports.DemoVideoSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
});
