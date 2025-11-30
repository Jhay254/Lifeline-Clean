import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';
import Logger from '../utils/logger';

const execAsync = util.promisify(exec);

export class BackupService {
    private backupDir: string;
    private mediaDir: string;

    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.mediaDir = path.join(process.cwd(), 'uploads'); // Assuming uploads are here

        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Backup PostgreSQL database running in Docker
     */
    async backupDatabase(): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-db-${timestamp}.sql.gz`;
        const filepath = path.join(this.backupDir, filename);

        // Command to run pg_dump inside the docker container
        // Note: This assumes the container name is 'lifeline-postgres' as defined in docker-compose
        const containerName = 'lifeline-postgres';
        const dbUser = process.env.DB_USER || 'lifeline';
        const dbName = process.env.DB_NAME || 'lifeline_db';

        Logger.info(`Starting database backup: ${filename}`);

        try {
            // We use docker exec to run pg_dump inside the container and pipe output to a file on host
            // On Windows, we need to be careful with piping. 
            // We'll try a standard command that works in most shells.
            const command = `docker exec ${containerName} pg_dump -U ${dbUser} ${dbName} | gzip > "${filepath}"`;

            await execAsync(command);

            Logger.info(`Database backup completed successfully: ${filepath}`);
            return filepath;
        } catch (error: any) {
            Logger.error(`Database backup failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Backup Media files (uploads directory)
     * For now, we'll just zip the directory. In production, you'd sync to S3/R2.
     */
    async backupMedia(): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-media-${timestamp}.zip`;
        const filepath = path.join(this.backupDir, filename);

        Logger.info(`Starting media backup: ${filename}`);

        try {
            // Using tar to compress the directory (available on most systems including Win 10+ via tar.exe or git bash)
            // Alternatively, we could use a node library like 'archiver' for better cross-platform support.
            // Let's use 'archiver' if we were installing it, but to avoid deps for now, we'll try tar.
            // If tar isn't available, this might fail on old Windows, but User is on Windows 10/11 likely.

            // tar -czf target source
            const command = `tar -czf "${filepath}" -C "${path.dirname(this.mediaDir)}" "${path.basename(this.mediaDir)}"`;

            await execAsync(command);

            Logger.info(`Media backup completed successfully: ${filepath}`);
            return filepath;
        } catch (error: any) {
            Logger.error(`Media backup failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Clean up old backups (keep last 30 days)
     */
    async cleanupOldBackups(retentionDays: number = 30): Promise<void> {
        try {
            const files = fs.readdirSync(this.backupDir);
            const now = Date.now();
            const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

            let deletedCount = 0;

            for (const file of files) {
                const filepath = path.join(this.backupDir, file);
                const stats = fs.statSync(filepath);

                if (now - stats.mtimeMs > retentionMs) {
                    fs.unlinkSync(filepath);
                    deletedCount++;
                }
            }

            if (deletedCount > 0) {
                Logger.info(`Cleaned up ${deletedCount} old backup files`);
            }
        } catch (error: any) {
            Logger.error(`Backup cleanup failed: ${error.message}`);
        }
    }
}

export const backupService = new BackupService();
