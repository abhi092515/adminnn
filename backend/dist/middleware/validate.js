"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (e) {
        // The 'return' keyword is removed from the line below
        res.status(400).json({
            success: false,
            errors: e.errors,
        });
    }
};
exports.default = validate;
