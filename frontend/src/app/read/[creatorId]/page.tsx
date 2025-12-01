'use client';

import { BiographyReader } from '@/components/reader/BiographyReader';

interface ReadPageProps {
    params: {
        creatorId: string;
    };
}

export default function ReadPage({ params }: ReadPageProps) {
    // TODO: Fetch chapters from API
    const mockChapters = [
        {
            id: '1',
            title: 'Introduction',
            content: '<h2>Welcome to My Story</h2><p>This is the beginning of my journey...</p>',
            isLocked: false,
        },
        {
            id: '2',
            title: 'Early Years',
            content: '<h2>Growing Up</h2><p>My childhood was filled with adventures and learning experiences that shaped who I am today. From the small town where I was born to the bustling city where I eventually settled, every step of the journey taught me valuable lessons about life, friendship, and perseverance.</p>',
            isLocked: true,
            requiredTier: 'Bronze',
        },
        {
            id: '3',
            title: 'Career Journey',
            content: '<h2>Finding My Path</h2><p>The professional world opened up new opportunities...</p>',
            isLocked: true,
            requiredTier: 'Bronze',
        },
        {
            id: '4',
            title: 'Life Lessons',
            content: '<h2>What I\'ve Learned</h2><p>Through all the ups and downs, these are the insights I\'ve gained...</p>',
            isLocked: true,
            requiredTier: 'Gold',
        },
    ];

    return (
        <BiographyReader
            creatorId={params.creatorId}
            chapters={mockChapters}
            userTier="free"
        />
    );
}
