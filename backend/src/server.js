'use strict';

const app = require('./app');
const env = require('./config/env');
const { connectDatabase, closeDatabase } = require('./config/database');

const start = async () => {
  try {
    const target = await connectDatabase();
    console.log(
      `MySQL connected: ${target.user}@${target.host}:${target.port}/${target.database}` +
        `${target.ssl ? ' (TLS)' : ''}`
    );

    // Hosted platforms route traffic to the container, so bind all interfaces.
    const server = app.listen(env.port, env.host, () => {
      const publicUrl = env.publicDomain
        ? `https://${env.publicDomain}`
        : `http://localhost:${env.port}`;
      console.log(`Commerce API running on ${env.host}:${env.port} — ${publicUrl}`);
      console.log(`Health check available at ${publicUrl}/api/health`);
    });

    server.on('error', (error) => {
      console.error(`HTTP server error: ${error.message}`);
      process.exit(1);
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
