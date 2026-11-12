'use strict';

const app = require('./app');
const env = require('./config/env');
const { connectDatabase, closeDatabase } = require('./config/database');

const start = async () => {
  try {
    const target = await connectDatabase();
    console.log(
      `MySQL connected: ${target.user}@${target.host}:${target.port}/${target.database}`
    );

    const server = app.listen(env.port, () => {
      console.log(`Commerce API running at http://localhost:${env.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, closing the API server`);
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => shutdown(signal));
    });
  } catch (error) {
    console.error(`Failed to start the API: ${error.message}`);
    process.exit(1);
  }
};

start();

module.exports = app;
