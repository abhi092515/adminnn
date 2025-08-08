"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = require("../controllers/address.controller");
const router = (0, express_1.Router)();
// Route to create a new address
router.post('/', address_controller_1.createAddress);
// Route to get all addresses for a specific user
router.get('/user/:userId', address_controller_1.getUserAddresses);
// Routes to get, update, and delete a specific address by its ID
router.route('/:id')
    .get(address_controller_1.getAddressById)
    .put(address_controller_1.updateAddress)
    .delete(address_controller_1.deleteAddress);
exports.default = router;
