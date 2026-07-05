"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const socket_1 = require("./utils/socket");
function createApp() {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        },
    });
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use((0, morgan_1.default)('dev'));
    app.use(express_1.default.json());
    app.set('io', io);
    (0, socket_1.registerSocketHandlers)(io);
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/projects', project_routes_1.default);
    app.use('/api/tasks', task_routes_1.default);
    app.use((_req, _res, next) => {
        const error = new Error(`Route not found: ${_req.originalUrl}`);
        error.statusCode = 404;
        next(error);
    });
    app.use(errorHandler_1.errorHandler);
    return { app, httpServer };
}
const { app } = createApp();
exports.default = app;
