"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
exports.emitToProject = emitToProject;
function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        socket.on('join:project', (projectId) => {
            socket.join(projectId);
        });
        socket.on('leave:project', (projectId) => {
            socket.leave(projectId);
        });
    });
}
function emitToProject(io, projectId, event, payload) {
    io.to(projectId).emit(event, payload);
}
