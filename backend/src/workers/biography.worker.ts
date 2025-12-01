import { Worker, Job } from 'bullmq';
import { processBiographyGeneration, BiographyGenerationJobData } from '../jobs/biography-generation.job';
import { logger } from '../utils/logger';

const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
};

/**
 * Biography generation worker
 */
export const biographyWorker = new Worker(
    'biography-generation',
    async (job: Job<BiographyGenerationJobData>) => {
        logger.info(`Processing biography generation job ${job.id}`);

        const updateProgress = async (progress: number) => {
            await job.updateProgress(progress);
            logger.info(`Job ${job.id} progress: ${progress}%`);
        };

        try {
            const result = await processBiographyGeneration(job.data, updateProgress);
            logger.info(`Job ${job.id} completed successfully`);
            return result;
        } catch (error: any) {
            logger.error(`Job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection: REDIS_CONNECTION,
        concurrency: 2, // Process 2 biographies at a time
        limiter: {
            max: 10, // Max 10 jobs
            duration: 60000, // per minute
        },
    }
);

// Event handlers
biographyWorker.on('completed', (job) => {
    logger.info(`Biography generation job ${job.id} completed`);
});

biographyWorker.on('failed', (job, err) => {
    logger.error(`Biography generation job ${job?.id} failed:`, err);
});

biographyWorker.on('error', (err) => {
    logger.error('Biography worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing biography worker...');
    await biographyWorker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, closing biography worker...');
    await biographyWorker.close();
    process.exit(0);
});

logger.info('Biography worker started');
