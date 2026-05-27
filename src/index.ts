import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import rootRouter from './routes/index';
import apiRouter from './routes/api';

const app = express();

app.disable('x-powered-by');
app.use(morgan('dev'));
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/', rootRouter);
app.use('/api/v1', apiRouter);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
