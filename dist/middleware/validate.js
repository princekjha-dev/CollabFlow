"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const errorHandler_1 = require("./errorHandler");
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(new errorHandler_1.AppError('Validation failed', 400, result.error.flatten()));
        }
        req.body = result.data;
        next();
    };
}
