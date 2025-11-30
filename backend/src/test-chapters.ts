import { timelineService } from './services/biography/timeline.service';
import { chapterService } from './services/biography/chapter.service';
import { logger } from './utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testChapterGeneration() {
    try {
        logger.info('Starting Chapter Generation Test...');

        // 1. Create a test user
        const user = await prisma.user.create({
            data: {
                email: `test-chapters-${Date.now()}@example.com`,
                name: 'Chapter Test User',
            },
        });
        logger.info(`Created test user: ${user.id}`);

        // 2. Create events spanning multiple chapters
        const baseTime = new Date('2023-01-15');

        // Chapter 1: Early 2023 - Career
        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'LINKEDIN',
                platformId: `linkedin-${Date.now()}-1`,
                contentType: 'post',
                text: 'Started my new role as Software Engineer!',
                timestamp: baseTime,
            },
        });

        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'TWITTER',
                platformId: `twitter-${Date.now()}-2`,
                contentType: 'post',
                text: 'First week at the new job going great!',
                timestamp: new Date(baseTime.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
            },
        });

        // Chapter 2: Mid 2023 - Travel (90 day gap triggers boundary)
        const travelTime = new Date(baseTime.getTime() + 120 * 24 * 60 * 60 * 1000); // +120 days
        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'INSTAGRAM',
                platformId: `insta-${Date.now()}-3`,
                contentType: 'image',
                text: 'Exploring Tokyo! Amazing city 🗼',
                timestamp: travelTime,
            },
        });

        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'INSTAGRAM',
                platformId: `insta-${Date.now()}-4`,
                contentType: 'image',
                text: 'Mount Fuji at sunrise 🌄',
                timestamp: new Date(travelTime.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
            },
        });

        // Chapter 3: Late 2023 - Family (year boundary + category change)
        const familyTime = new Date('2024-01-01');
        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'FACEBOOK',
                platformId: `fb-${Date.now()}-5`,
                contentType: 'post',
                text: 'Happy New Year with family! 🎉',
                timestamp: familyTime,
            },
        });

        await prisma.content.create({
            data: {
                userId: user.id,
                provider: 'FACEBOOK',
                platformId: `fb-${Date.now()}-6`,
                contentType: 'post',
                text: 'Celebrating my daughter\'s birthday 🎂',
                timestamp: new Date(familyTime.getTime() + 14 * 24 * 60 * 60 * 1000), // +14 days
            },
        });

        // 3. Construct timeline
        logger.info('Constructing timeline...');
        const timeline = await timelineService.constructTimeline(user.id);

        // 4. Enrich with categorization
        logger.info('Enriching timeline...');
        const enrichedTimeline = await timelineService.enrichTimeline(timeline);

        // 5. Generate chapters
        logger.info('Generating chapters...');
        const chapters = await chapterService.generateChapters(enrichedTimeline, {
            minEventsPerChapter: 2,
            useAI: false, // Set to false to avoid API costs during testing
        });

        // 6. Display results
        console.log('\n================================================');
        console.log(`Total Events: ${enrichedTimeline.events.length}`);
        console.log(`Chapters Generated: ${chapters.length}`);
        console.log('================================================\n');

        chapters.forEach((chapter, index) => {
            console.log(`Chapter ${index + 1}: ${chapter.title}`);
            console.log(`  Period: ${chapter.startDate.toLocaleDateString()} - ${chapter.endDate.toLocaleDateString()}`);
            console.log(`  Duration: ${chapter.metadata.durationDays} days`);
            console.log(`  Events: ${chapter.metadata.eventCount}`);
            console.log(`  Category: ${chapter.dominantCategory}`);
            console.log(`  Summary: ${chapter.summary}`);
            console.log('');
        });

        console.log('================================================');

        if (chapters.length >= 2) {
            logger.info('✅ Chapter Generation Test PASSED');
        } else {
            logger.error(`❌ Chapter Generation Test FAILED: Expected at least 2 chapters, got ${chapters.length}`);
        }

        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });

    } catch (error) {
        logger.error('Test failed with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testChapterGeneration();
