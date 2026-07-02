import express, { type Application } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Application = express();

const allowedOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3001';

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
  }),
);

app.use(express.json());
app.use(routes);

export default app;
