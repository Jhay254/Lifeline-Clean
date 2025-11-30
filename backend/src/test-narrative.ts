import { timelineService } from './services/biography/timeline.service';
import { chapterService } from './services/biography/chapter.service';
import { narrativeService } from './services/biography/narrative.service';
import { NarrativeStyle } from './types/narrative';
import { logger } from './utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNarrativeGeneration() {
    try {
        logger.info('Starting Narrative Generation Test...');

        // 1. Create test user
        const user = await prisma.user.create({
            data: {
                email: `test-narrative-${Date.now()}@example.com`,
                name: 'Narrative Test User',
            },
        });
        logger.info(`Created test user: ${user.id}`);

        // 2. Create diverse events for rich narrative
        const baseTime = new Date('2023-01-01');

        // Career events
        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'LINKEDIN',
                platformId: `linkedin-${Date.now()}-1`,
                contentType: 'post',
                text: 'Excited to start my new role as Senior Software Engineer at TechCorp! Ready for new challenges.',
                timestamp: baseTime,
            },
        });

        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'TWITTER',
                platformId: `twitter-${Date.now()}-2`,
                contentType: 'post',
                text: 'Just shipped my first major feature at work. Feeling accomplished!',
                timestamp: new Date(baseTime.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        // Travel events
        const travelTime = new Date(baseTime.getTime() + 120 * 24 * 60 * 60 * 1000);
        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'INSTAGRAM',
                platformId: `insta-${Date.now()}-3`,
                contentType: 'image',
                text: 'Exploring the streets of Tokyo! This city is incredible 🗼',
                timestamp: travelTime,
            },
        });

        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'INSTAGRAM',
                platformId: `insta-${Date.now()}-4`,
                contentType: 'image',
                text: 'Sunrise at Mount Fuji. One of the most beautiful moments of my life 🌄',
                timestamp: new Date(travelTime.getTime() + 3 * 24 * 60 * 60 * 1000),
            },
        });

        // Family events
        const familyTime = new Date('2024-01-01');
        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'FACEBOOK',
                platformId: `fb-${Date.now()}-5`,
                contentType: 'post',
                text: 'Happy New Year with my amazing family! Grateful for another year together 🎉',
                timestamp: familyTime,
            },
        });

        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'FACEBOOK',
                platformId: `fb-${Date.now()}-6`,
                contentType: 'post',
                text: "My daughter's 5th birthday party was a huge success! She's growing up so fast 🎂",
                timestamp: new Date(familyTime.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        // 3. Build timeline
        logger.info('Constructing timeline...');
        const timeline = await timelineService.constructTimeline(user.id);

        // 4. Enrich timeline
        logger.info('Enriching timeline...');
        const enrichedTimeline = await timelineService.enrichTimeline(timeline);

        // 5. Generate chapters
        logger.info('Generating chapters...');
        const chapters = await chapterService.generateChapters(enrichedTimeline, {
            minEventsPerChapter: 2,
            useAI: false, // Use simple titles to save costs
        });

        // 6. Test different narrative styles
        const stylesToTest = [
            NarrativeStyle.CHRONOLOGICAL,
            NarrativeStyle.REFLECTIVE,
        ];

        console.log('\n================================================');
        console.log('NARRATIVE GENERATION TEST RESULTS');
        console.log('================================================\n');

        for (const style of stylesToTest) {
            console.log(`\n--- Testing ${style.toUpperCase()} Style ---\n`);

            try {
                // Generate biography (this will use AI if OpenAI is configured)
                const biography = await narrativeService.generateBiography(
                    chapters,
                    enrichedTimeline,
                    style
                );

                console.log(`Title: ${biography.title}`);
                console.log(`Style: ${biography.style}`);
                console.log(`Chapters: ${biography.chapters.length}`);
                console.log(`Total Words: ${biography.metadata.totalWords}`);
                console.log(`Generation Time: ${biography.metadata.generationTime}ms`);
                console.log(`Estimated Cost: $${biography.metadata.cost.toFixed(4)}`);
                console.log('\nIntroduction:');
                console.log(biography.introduction.substring(0, 200) + '...\n');

                if (biography.chapters.length > 0) {
                    console.log('First Chapter:');
                    console.log(`  Title: ${biography.chapters[0].title}`);
                    console.log(`  Words: ${biography.chapters[0].wordCount}`);
                    console.log(`  Narrative Preview:`);
                    console.log(`  ${biography.chapters[0].narrative.substring(0, 300)}...\n`);
                    console.log(`  Media Matches: ${biography.chapters[0].mediaMatches.length}`);
                }

                console.log('✅ Biography generated successfully!\n');
            } catch (error: any) {
                console.log(`❌ Error generating ${style} biography:`, error.message);
            }
        }

        console.log('================================================\n');

        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });

        logger.info('✅ Narrative Generation Test COMPLETE');

    } catch (error) {
        logger.error('Test failed with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNarrativeGeneration();
