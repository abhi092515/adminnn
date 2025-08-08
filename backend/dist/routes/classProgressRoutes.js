"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classProgressController_1 = require("../controllers/classProgressController");
const router = (0, express_1.Router)();
router.get('/', classProgressController_1.getClassProgress);
router.post('/', classProgressController_1.createClassProgress);
exports.default = router;
