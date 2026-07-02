import 'dotenv/config';
import { initLogger } from './services/logger';
import app from './app';

initLogger();

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.info(`[server] Running on http://localhost:${PORT}`);
  console.info(
    `[server] Environment: ${process.env.NODE_ENV ?? 'development'}`,
  );
});
