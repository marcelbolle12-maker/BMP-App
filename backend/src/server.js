import app from './app.js';
import { prisma } from './config/prisma.js';

const port = process.env.PORT || 4000;

async function start() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
