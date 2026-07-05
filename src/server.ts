import { createApp } from './app';
import { env } from './config/env';

const { app, httpServer } = createApp();

httpServer.listen(env.port, () => {
  console.log(`CollabFlow API listening on port ${env.port}`);
});
