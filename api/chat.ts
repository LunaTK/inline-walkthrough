import { app } from "../server/app.js";

// Vercel invokes the same Express app for /api/chat without opening a persistent port.
export default app;
