/**
 * Sentiment score with multiple dimensions
 */
export interface SentimentScore {
    valence: number; // -1.0 (negative) to 1.0 (positive)
    arousal: number; // 0.0 (calm) to 1.0 (excited)
    dominance: number; // 0.0 (powerless) to 1.0 (empowered)
    primaryEmotion: EmotionCategory;
    confidence: number; // 0.0 to 1.0
}

/**
 * Emotion categories
 */
export enum EmotionCategory {
    JOY = 'Joy',
    SADNESS = 'Sadness',
    ANGER = 'Anger',
    FEAR = 'Fear',
    SURPRISE = 'Surprise',
    DISGUST = 'Disgust',
    CONTENTMENT = 'Contentment',
    EXCITEMENT = 'Excitement',
    ANXIETY = 'Anxiety',
    NEUTRAL = 'Neutral',
}

/**
 * Mood timeline data point
 */
export interface MoodDataPoint {
    date: Date;
    valence: number;
    arousal: number;
    dominance: number;
    primaryEmotion: EmotionCategory;
    eventCount: number;
}

/**
 * Complete mood timeline
 */
export interface MoodTimeline {
    userId: string;
    dataPoints: MoodDataPoint[];
    averages: {
        valence: number;
        arousal: number;
        dominance: number;
    };
    milestones: EmotionalMilestone[];
}

/**
 * Emotional milestone (peak or valley)
 */
export interface EmotionalMilestone {
    date: Date;
    type: 'peak' | 'valley';
    emotion: EmotionCategory;
    intensity: number; // 0.0 to 1.0
    reason?: string;
    eventIds: string[];
}

/**
 * Aggregation period for mood data
 */
export enum AggregationPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}
