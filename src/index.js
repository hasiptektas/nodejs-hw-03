import { initMongoDB } from './db/initMongoConnection.js';
import { startServer } from './server.js';

const bootstrap = async () => {
  try {
    await initMongoDB();
    startServer();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
};

bootstrap();