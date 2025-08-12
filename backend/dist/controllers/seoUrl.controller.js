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
exports.getSeoUrlById = exports.updatePriority = exports.deleteSeoUrl = exports.updateSeoUrl = exports.createSeoUrl = exports.getAllSeoUrls = void 0;
const seoUrl_model_1 = require("../models/seoUrl.model");
const getAllSeoUrls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customer_id } = req.body;
        // ✅ FIX: Changed the filter to be empty by default to fetch ALL URLs.
        const filter = {};
        if (customer_id) {
            filter.customer_id = customer_id;
        }
        const urls = yield seoUrl_model_1.SeoUrl.find(filter).sort({ createdAt: -1 });
        res.status(200).json(urls);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching SEO URLs', error });
    }
});
exports.getAllSeoUrls = getAllSeoUrls;
const createSeoUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUrl = yield seoUrl_model_1.SeoUrl.create(req.body);
        res.status(201).json({ message: 'URL added successfully.', data: newUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating SEO URL', error });
    }
});
exports.createSeoUrl = createSeoUrl;
const updateSeoUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { customer_id } = req.body;
        const filter = { _id: id };
        if (customer_id) {
            filter.customer_id = customer_id;
        }
        const updatedUrl = yield seoUrl_model_1.SeoUrl.findOneAndUpdate(filter, req.body, { new: true });
        if (!updatedUrl) {
            // CORRECT PATTERN: Send response, then return to exit.
            res.status(404).json({ message: 'URL not found or you do not have permission to edit it.' });
            return;
        }
        res.status(200).json({ message: 'URL updated successfully.', data: updatedUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating SEO URL', error });
    }
});
exports.updateSeoUrl = updateSeoUrl;
const deleteSeoUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { customer_id } = req.body;
        const filter = { _id: id };
        if (customer_id) {
            filter.customer_id = customer_id;
        }
        const deletedUrl = yield seoUrl_model_1.SeoUrl.findOneAndUpdate(filter, { isActive: false }, { new: true });
        if (!deletedUrl) {
            // CORRECT PATTERN: Send response, then return to exit.
            res.status(404).json({ message: 'URL not found or you do not have permission to delete it.' });
            return;
        }
        res.status(200).json({ message: 'URL inactive successfully.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting SEO URL', error });
    }
});
exports.deleteSeoUrl = deleteSeoUrl;
const updatePriority = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { priority, customer_id } = req.body;
        const filter = { _id: id };
        if (typeof priority !== 'number') {
            res.status(400).json({ message: 'Priority must be a number.' });
            return;
        }
        if (customer_id) {
            filter.customer_id = customer_id;
        }
        const updatedUrl = yield seoUrl_model_1.SeoUrl.findOneAndUpdate(filter, { priority }, { new: true });
        if (!updatedUrl) {
            // CORRECT PATTERN: Send response, then return to exit.
            res.status(404).json({ message: 'URL not found or you do not have permission to edit it.' });
            return;
        }
        res.status(200).json({ message: 'Priority updated successfully.', data: updatedUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating priority', error });
    }
});
exports.updatePriority = updatePriority;
const getSeoUrlById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const url = yield seoUrl_model_1.SeoUrl.findById(id);
        if (!url) {
            res.status(404).json({ message: 'URL not found.' });
            return;
        }
        // Important: We wrap it in a `data` property to match what the frontend hook expects
        res.status(200).json({ success: true, data: url });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching SEO URL', error });
    }
});
exports.getSeoUrlById = getSeoUrlById;
