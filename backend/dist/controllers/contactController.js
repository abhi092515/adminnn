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
exports.deleteContact = exports.updateContact = exports.getContactById = exports.getAllContacts = exports.createContact = void 0;
const contact_1 = __importDefault(require("../models/contact"));
// Create a new contact
const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newContact = new contact_1.default(req.body);
        yield newContact.save();
        res.status(201).json({
            success: true,
            data: newContact,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
exports.createContact = createContact;
// Get all contacts
const getAllContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contacts = yield contact_1.default.find();
        res.status(200).json({
            success: true,
            data: contacts,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
exports.getAllContacts = getAllContacts;
// Get a single contact by ID
const getContactById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.default.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ success: false, error: 'Contact not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: contact,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
exports.getContactById = getContactById;
// Update a contact by ID
const updateContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!contact) {
            res.status(404).json({ success: false, error: 'Contact not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: contact,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
exports.updateContact = updateContact;
// Delete a contact by ID
const deleteContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contact_1.default.findByIdAndDelete(req.params.id);
        if (!contact) {
            res.status(404).json({ success: false, error: 'Contact not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
exports.deleteContact = deleteContact;
