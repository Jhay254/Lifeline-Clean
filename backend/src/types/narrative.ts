/**
 * Narrative writing styles
 */
export enum NarrativeStyle {
    CHRONOLOGICAL = 'chronological',
    THEMATIC = 'thematic',
    REFLECTIVE = 'reflective',
    DOCUMENTARY = 'documentary',
    HIGHLIGHTS = 'highlights',
}

/**
 * Complete biography document
 */
export interface Biography {
    id: string;
    userId: string;
    title: string;
    style: NarrativeStyle;
    chapters: BiographyChapterNarrative[];
    introduction: string;
    conclusion: string;
    metadata: {
        totalWords: number;
        totalChapters: number;
        generatedAt: Date;
        cost: number;
        generationTime: number; // milliseconds
    };
}

/**
 * Chapter with narrative content
 */
export interface BiographyChapterNarrative {
    chapterId: string;
    title: string;
    narrative: string;
    mediaMatches: MediaMatch[];
    wordCount: number;
}

/**
 * Media matched to narrative
 */
export interface MediaMatch {
    mediaId: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    placementIndex: number; // Character index in narrative
    relevanceScore: number; // 0-1
    caption?: string;
}

/**
 * Narrative section for organization
 */
export interface NarrativeSection {
    id: string;
    heading: string;
    content: string;
    startDate?: Date;
    endDate?: Date;
}
