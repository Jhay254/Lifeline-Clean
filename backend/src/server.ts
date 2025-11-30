import app from './app';
import dotenv from 'dotenv';
import { initializeCronJobs } from './jobs/cron';
import Logger from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    Logger.info(`Server is running on port ${PORT}`);

    // Initialize cron jobs
    initializeCronJobs();
});

process.on('SIGTERM', () => {
    Logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        Logger.info('HTTP server closed');
    });
});
