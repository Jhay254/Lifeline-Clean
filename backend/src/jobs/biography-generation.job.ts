import { Queue } from 'bullmq';
import { timelineService } from '../services/biography/timeline.service';
import { chapterService } from '../services/biography/chapter.service';
import { narrativeService } from '../services/biography/narrative.service';
import { sentimentService } from '../services/biography/sentiment.service';
import { NarrativeStyle } from '../types/narrative';
import { ChapterGenerationOptions } from '../types/chapter';
import { logger } from '../utils/logger';

/**
 * Biography generation job data
 */
export interface BiographyGenerationJobData {
    userId: string;
    style: NarrativeStyle;
    options: {
        includeMedia: boolean;
        includeSentiment: boolean;
        chapterOptions: ChapterGenerationOptions;
    };
}

/**
 * Biography generation job result
 */
export interface BiographyGenerationResult {
    biographyId: string;
    totalWords: number;
    totalChapters: number;
    cost: number;
    generationTime: number;
}

/**
 * Process biography generation job
 */
export async function processBiographyGeneration(
    jobData: BiographyGenerationJobData,
    updateProgress: (progress: number) => Promise<void>
): Promise<BiographyGenerationResult> {
    const startTime = Date.now();
    const { userId, style, options } = jobData;

    logger.info(`Starting biography generation for user ${userId}`);

    try {
        // Step 1: Build Timeline (10%)
        await updateProgress(10);
        logger.info('Step 1: Constructing timeline...');
        const timeline = await timelineService.constructTimeline(userId);

        // Step 2: Categorize Events (30%)
        await updateProgress(30);
        logger.info('Step 2: Categorizing events...');
        const enrichedTimeline = await timelineService.enrichTimeline(timeline);

        // Step 3: Sentiment Analysis (50%)
        if (options.includeSentiment) {
            await updateProgress(50);
            logger.info('Step 3: Analyzing sentiment...');
            await sentimentService.generateMoodTimeline(enrichedTimeline.events);
        }

        // Step 4: Generate Chapters (70%)
        await updateProgress(70);
        logger.info('Step 4: Generating chapters...');
        const chapters = await chapterService.generateChapters(
            enrichedTimeline,
            options.chapterOptions
        );

        // Step 5: Generate Narrative (90%)
        await updateProgress(90);
        logger.info('Step 5: Generating narrative...');
        const biography = await narrativeService.generateBiography(
            chapters,
            enrichedTimeline,
            style
        );

        // Step 6: Complete (100%)
        await updateProgress(100);
        const generationTime = Date.now() - startTime;

        logger.info(`Biography generation complete: ${biography.id}`);

        return {
            biographyId: biography.id,
            totalWords: biography.metadata.totalWords,
            totalChapters: biography.metadata.totalChapters,
            cost: biography.metadata.cost,
            generationTime,
        };
    } catch (error) {
        logger.error('Biography generation failed:', error);
        throw error;
    }
}
