import { BiographyCategory } from './categories';

/**
 * Represents a chapter in a biography
 */
export interface BiographyChapter {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    eventIds: string[];
    summary: string;
    dominantCategory: BiographyCategory;
    significance: number;
    metadata: {
        eventCount: number;
        durationDays: number;
        aiGenerated: boolean;
        confidence?: number;
    };
}

/**
 * Chapter boundary detection result
 */
export interface ChapterBoundary {
    index: number;
    timestamp: Date;
    reason: string;
    strength: number; // 0-1, how strong the boundary is
}

/**
 * Chapter generation options
 */
export interface ChapterGenerationOptions {
    minEventsPerChapter?: number;
    maxEventsPerChapter?: number;
    minChapterDurationDays?: number;
    maxChapterDurationDays?: number;
    useAI?: boolean;
}
