import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request
    Logger.http(`${req.method} ${req.url}`);

    // Log response on finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.url} ${res.statusCode} ${duration}ms`;

        if (res.statusCode >= 400) {
            Logger.error(message);
        } else {
            Logger.http(message);
        }
    });

    next();
};
