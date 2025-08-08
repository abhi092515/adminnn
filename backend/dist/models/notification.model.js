"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    videoLink: {
        type: String,
    },
    redirectUrl: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
exports.default = Notification;
