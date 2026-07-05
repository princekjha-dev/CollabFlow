import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer, type Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middleware/errorHandler';
import { registerSocketHandlers } from './utils/socket';

export function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());

  app.set('io', io);
  registerSocketHandlers(io);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);

  app.use((_req: Request, _res: Response, next: NextFunction) => {
    const error = new Error(`Route not found: ${_req.originalUrl}`) as Error & { statusCode?: number };
    error.statusCode = 404;
    next(error);
  });

  app.use(errorHandler);

  return { app, httpServer };
}

const { app } = createApp();
export default app;
