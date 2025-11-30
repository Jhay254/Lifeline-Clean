import cron from 'node-cron';
import { TokenRefreshService } from '../services/token-refresh.service';
import { pkceService } from '../services/pkce.service';
import { backupService } from '../services/backup.service';
import Logger from '../utils/logger';

const tokenRefreshService = new TokenRefreshService();

export function initializeCronJobs() {
    Logger.info('Initializing cron jobs...');

    // Run token refresh every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        Logger.info('Running scheduled token refresh...');
        try {
            await tokenRefreshService.refreshAllTokens();
        } catch (error: any) {
            Logger.error(`Token refresh cron job failed: ${error.message}`);
        }
    });

    // Run PKCE cleanup every hour
    cron.schedule('0 * * * *', async () => {
        Logger.debug('Running PKCE cleanup...');
        try {
            await pkceService.cleanup();
        } catch (error: any) {
            Logger.error(`PKCE cleanup cron job failed: ${error.message}`);
        }
    });

    // Run Database Backup daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        Logger.info('Running daily database backup...');
        try {
            await backupService.backupDatabase();
        } catch (error: any) {
            Logger.error(`Database backup cron job failed: ${error.message}`);
        }
    });

    // Run Media Backup weekly on Sunday at 3:00 AM
    cron.schedule('0 3 * * 0', async () => {
        Logger.info('Running weekly media backup...');
        try {
            await backupService.backupMedia();
        } catch (error: any) {
            Logger.error(`Media backup cron job failed: ${error.message}`);
        }
    });

    // Run Backup Cleanup daily at 4:00 AM
    cron.schedule('0 4 * * *', async () => {
        Logger.info('Running backup cleanup...');
        try {
            await backupService.cleanupOldBackups();
        } catch (error: any) {
            Logger.error(`Backup cleanup cron job failed: ${error.message}`);
        }
    });

    Logger.info('Cron jobs initialized successfully');
}
