import { type Server as SocketIOServer, type Socket } from 'socket.io';

export function registerSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    socket.on('join:project', (projectId: string) => {
      socket.join(projectId);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(projectId);
    });
  });
}

export function emitToProject(io: SocketIOServer, projectId: string, event: string, payload: unknown) {
  io.to(projectId).emit(event, payload);
}
