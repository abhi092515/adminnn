"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subTopic_controller_1 = require("../controllers/subTopic.controller");
const router = (0, express_1.Router)();
router.route('/')
    .get(subTopic_controller_1.getAllSubTopics)
    .post(subTopic_controller_1.createSubTopic);
router.route('/:id')
    .get(subTopic_controller_1.getSubTopicById)
    .put(subTopic_controller_1.updateSubTopic)
    .delete(subTopic_controller_1.deleteSubTopic);
exports.default = router;
