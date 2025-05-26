import express from 'express';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { authRouter } from './routers/auth.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { UPLOAD_DIR } from './constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startServer = () => {
  const app = express();

  // Middlewares
  app.use(express.json());

  app.use(cookieParser());

  // Swagger UI
  const swaggerDocument = YAML.parse(
    fs.readFileSync(path.join(__dirname, '../docs/openapi.yaml'), 'utf8')
  );
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Contact Management API Documentation'
    })
  );

  // Routes
  app.use('/auth', authRouter);
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