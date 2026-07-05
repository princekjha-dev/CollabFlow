"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const { app, httpServer } = (0, app_1.createApp)();
httpServer.listen(env_1.env.port, () => {
    console.log(`CollabFlow API listening on port ${env_1.env.port}`);
});
