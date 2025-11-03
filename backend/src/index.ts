import app from './app';
import config from './config/env';
import pool from './config/database';

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Start server
    app.listen(config.port, () => {
      console.log(`
🚀 Server running in ${config.nodeEnv} mode
📡 Port: ${config.port}
🔗 URL: ${config.baseUrl}
🌐 Frontend: ${config.frontendUrl}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
