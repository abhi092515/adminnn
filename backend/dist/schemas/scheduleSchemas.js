"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatchScheduleSchema = void 0;
const zod_1 = require("zod");
exports.getBatchScheduleSchema = zod_1.z.object({
    startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date format",
    }),
    endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date format",
    }),
});
