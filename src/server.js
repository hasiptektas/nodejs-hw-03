import express from 'express';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { authRouter } from './routers/auth.js';

import { UPLOAD_DIR } from './constants/index.js';

export const startServer = () => {
  const app = express();

  // Middlewares
  app.use(express.json());

  app.use(cookieParser());
  app.use('/auth', authRouter);

  // Routes
  app.use('/contacts', contactsRouter);

  app.use('/uploads', express.static(UPLOAD_DIR));

  // 404 Handler
  app.use(notFoundHandler);

  // Error Handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  return server;
};