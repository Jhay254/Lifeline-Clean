import { TimelineEvent } from '../../types/biography';
import {
    SentimentScore,
    EmotionCategory,
    MoodTimeline,
    MoodDataPoint,
    EmotionalMilestone,
    AggregationPeriod,
} from '../../types/sentiment';
import openaiService from '../ai/openai.service';
import { logger } from '../../utils/logger';

export class SentimentService {
    /**
     * Analyze sentiment of a single event
     */
    async analyzeEvent(event: TimelineEvent): Promise<SentimentScore> {
        try {
            const prompt = `Analyze the emotional sentiment of this life event:

"${event.content}"

Provide scores for:
- Valence: -1.0 (very negative) to 1.0 (very positive)
- Arousal: 0.0 (very calm) to 1.0 (very excited)
- Dominance: 0.0 (powerless) to 1.0 (empowered)
- Primary emotion: Joy, Sadness, Anger, Fear, Surprise, Disgust, Contentment, Excitement, Anxiety, or Neutral

Output JSON format:
{
  "valence": 0.8,
  "arousal": 0.6,
  "dominance": 0.7,
  "primaryEmotion": "Joy",
  "confidence": 0.9
}`;

            const response = await openaiService.generateText(prompt, {
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                maxTokens: 150,
                systemPrompt: 'You are an expert in emotional analysis and sentiment detection.',
            });

            const parsed = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());

            return {
                valence: this.clamp(parsed.valence, -1, 1),
                arousal: this.clamp(parsed.arousal, 0, 1),
                dominance: this.clamp(parsed.dominance, 0, 1),
                primaryEmotion: this.validateEmotion(parsed.primaryEmotion),
                confidence: this.clamp(parsed.confidence, 0, 1),
            };
        } catch (error) {
            logger.error(`Error analyzing sentiment for event ${event.id}:`, error);
            return this.getDefaultSentiment();
        }
    }

    /**
     * Analyze batch of events
     */
    async analyzeBatch(events: TimelineEvent[]): Promise<Map<string, SentimentScore>> {
        const results = new Map<string, SentimentScore>();
        const BATCH_SIZE = 10;

        for (let i = 0; i < events.length; i += BATCH_SIZE) {
            const batch = events.slice(i, i + BATCH_SIZE);

            try {
                const batchPrompt = this.buildBatchPrompt(batch);
                const response = await openaiService.generateText(batchPrompt, {
                    model: 'gpt-3.5-turbo',
                    temperature: 0.3,
                    maxTokens: 800,
                    systemPrompt: 'You are an expert in emotional analysis and sentiment detection.',
                });

                const parsed = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());

                if (Array.isArray(parsed)) {
                    batch.forEach((event, index) => {
                        if (parsed[index]) {
                            results.set(event.id, {
                                valence: this.clamp(parsed[index].valence, -1, 1),
                                arousal: this.clamp(parsed[index].arousal, 0, 1),
                                dominance: this.clamp(parsed[index].dominance, 0, 1),
                                primaryEmotion: this.validateEmotion(parsed[index].primaryEmotion),
                                confidence: this.clamp(parsed[index].confidence, 0, 1),
                            });
                        } else {
                            results.set(event.id, this.getDefaultSentiment());
                        }
                    });
                }
            } catch (error) {
                logger.error(`Error analyzing batch ${i}-${i + BATCH_SIZE}:`, error);
                batch.forEach(event => results.set(event.id, this.getDefaultSentiment()));
            }
        }

        return results;
    }

    /**
     * Generate mood timeline from events
     */
    async generateMoodTimeline(
        events: TimelineEvent[],
        period: AggregationPeriod = AggregationPeriod.WEEKLY
    ): Promise<MoodTimeline> {
        logger.info(`Generating mood timeline for ${events.length} events`);

        // Analyze all events
        const sentiments = await this.analyzeBatch(events);

        // Attach sentiment to events
        events.forEach(event => {
            const sentiment = sentiments.get(event.id);
            if (sentiment) {
                event.metadata = {
                    ...event.metadata,
                    sentiment,
                };
            }
        });

        // Aggregate by period
        const dataPoints = this.aggregateByPeriod(events, period);

        // Calculate averages
        const averages = this.calculateAverages(dataPoints);

        // Detect milestones
        const milestones = this.detectEmotionalMilestones(events, sentiments);

        return {
            userId: events[0]?.userId || '',
            dataPoints,
            averages,
            milestones,
        };
    }

    /**
     * Detect emotional peaks and valleys
     */
    detectEmotionalMilestones(
        events: TimelineEvent[],
        sentiments: Map<string, SentimentScore>
    ): EmotionalMilestone[] {
        const milestones: EmotionalMilestone[] = [];
        const THRESHOLD = 0.7; // Intensity threshold for milestones

        events.forEach(event => {
            const sentiment = sentiments.get(event.id);
            if (!sentiment) return;

            // Calculate intensity (distance from neutral)
            const intensity = Math.abs(sentiment.valence);

            // Peak: Very positive
            if (sentiment.valence > THRESHOLD && intensity > THRESHOLD) {
                milestones.push({
                    date: event.timestamp,
                    type: 'peak',
                    emotion: sentiment.primaryEmotion,
                    intensity,
                    reason: event.content.substring(0, 100),
                    eventIds: [event.id],
                });
            }

            // Valley: Very negative
            if (sentiment.valence < -THRESHOLD && intensity > THRESHOLD) {
                milestones.push({
                    date: event.timestamp,
                    type: 'valley',
                    emotion: sentiment.primaryEmotion,
                    intensity,
                    reason: event.content.substring(0, 100),
                    eventIds: [event.id],
                });
            }
        });

        // Sort by date
        return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    /**
     * Build batch prompt for multiple events
     */
    private buildBatchPrompt(events: TimelineEvent[]): string {
        const eventList = events
            .map((e, i) => `${i + 1}. "${e.content.substring(0, 150)}"`)
            .join('\n');

        return `Analyze the emotional sentiment of these life events. Return a JSON array with one object per event in the same order.

Events:
${eventList}

For each event, provide:
- valence: -1.0 (very negative) to 1.0 (very positive)
- arousal: 0.0 (very calm) to 1.0 (very excited)
- dominance: 0.0 (powerless) to 1.0 (empowered)
- primaryEmotion: Joy, Sadness, Anger, Fear, Surprise, Disgust, Contentment, Excitement, Anxiety, or Neutral
- confidence: 0.0 to 1.0

Output format:
[
  {"valence": 0.8, "arousal": 0.6, "dominance": 0.7, "primaryEmotion": "Joy", "confidence": 0.9},
  ...
]`;
    }

    /**
     * Aggregate events by time period
     */
    private aggregateByPeriod(
        events: TimelineEvent[],
        period: AggregationPeriod
    ): MoodDataPoint[] {
        const groups = new Map<string, TimelineEvent[]>();

        events.forEach(event => {
            const key = this.getPeriodKey(event.timestamp, period);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(event);
        });

        const dataPoints: MoodDataPoint[] = [];

        groups.forEach((groupEvents, key) => {
            const sentiments = groupEvents
                .map(e => e.metadata.sentiment as SentimentScore)
                .filter(s => s !== undefined);

            if (sentiments.length === 0) return;

            const avgValence = sentiments.reduce((sum, s) => sum + s.valence, 0) / sentiments.length;
            const avgArousal = sentiments.reduce((sum, s) => sum + s.arousal, 0) / sentiments.length;
            const avgDominance = sentiments.reduce((sum, s) => sum + s.dominance, 0) / sentiments.length;

            // Determine primary emotion
            const emotionCounts = new Map<EmotionCategory, number>();
            sentiments.forEach(s => {
                emotionCounts.set(s.primaryEmotion, (emotionCounts.get(s.primaryEmotion) || 0) + 1);
            });
            const primaryEmotion = Array.from(emotionCounts.entries())
                .sort((a, b) => b[1] - a[1])[0][0];

            dataPoints.push({
                date: groupEvents[0].timestamp,
                valence: avgValence,
                arousal: avgArousal,
                dominance: avgDominance,
                primaryEmotion,
                eventCount: groupEvents.length,
            });
        });

        return dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    /**
     * Get period key for aggregation
     */
    private getPeriodKey(date: Date, period: AggregationPeriod): string {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        switch (period) {
            case AggregationPeriod.DAILY:
                return `${year}-${month}-${day}`;
            case AggregationPeriod.WEEKLY:
                const weekNum = Math.floor(day / 7);
                return `${year}-${month}-W${weekNum}`;
            case AggregationPeriod.MONTHLY:
                return `${year}-${month}`;
            default:
                return `${year}-${month}`;
        }
    }

    /**
     * Calculate overall averages
     */
    private calculateAverages(dataPoints: MoodDataPoint[]): {
        valence: number;
        arousal: number;
        dominance: number;
    } {
        if (dataPoints.length === 0) {
            return { valence: 0, arousal: 0.5, dominance: 0.5 };
        }

        return {
            valence: dataPoints.reduce((sum, dp) => sum + dp.valence, 0) / dataPoints.length,
            arousal: dataPoints.reduce((sum, dp) => sum + dp.arousal, 0) / dataPoints.length,
            dominance: dataPoints.reduce((sum, dp) => sum + dp.dominance, 0) / dataPoints.length,
        };
    }

    /**
     * Clamp value between min and max
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Validate emotion category
     */
    private validateEmotion(emotion: string): EmotionCategory {
        const values = Object.values(EmotionCategory);
        if (values.includes(emotion as EmotionCategory)) {
            return emotion as EmotionCategory;
        }
        return EmotionCategory.NEUTRAL;
    }

    /**
     * Get default sentiment for errors
     */
    private getDefaultSentiment(): SentimentScore {
        return {
            valence: 0,
            arousal: 0.5,
            dominance: 0.5,
            primaryEmotion: EmotionCategory.NEUTRAL,
            confidence: 0,
        };
    }
}

export const sentimentService = new SentimentService();
