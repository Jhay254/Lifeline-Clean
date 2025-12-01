'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Lock, BookOpen } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Chapter {
    id: string;
    title: string;
    content: string;
    isLocked: boolean;
    requiredTier?: string;
}

interface BiographyReaderProps {
    creatorId: string;
    chapters: Chapter[];
    userTier?: string;
}

export function BiographyReader({ creatorId, chapters, userTier = 'free' }: BiographyReaderProps) {
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [paywallOpen, setPaywallOpen] = useState(false);

    const currentChapter = chapters[currentChapterIndex];
    const canAccess = !currentChapter.isLocked || userTier !== 'free';

    const handleNext = () => {
        if (currentChapterIndex < chapters.length - 1) {
            setCurrentChapterIndex(currentChapterIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentChapterIndex > 0) {
            setCurrentChapterIndex(currentChapterIndex - 1);
        }
    };

    const handleChapterClick = (index: number) => {
        const chapter = chapters[index];
        if (chapter.isLocked && userTier === 'free') {
            setPaywallOpen(true);
        } else {
            setCurrentChapterIndex(index);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Chapter List Sidebar */}
            <div className="w-64 border-r bg-background">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Chapters
                    </h2>
                </div>
                <ScrollArea className="h-[calc(100vh-73px)]">
                    <div className="p-2 space-y-1">
                        {chapters.map((chapter, index) => (
                            <button
                                key={chapter.id}
                                onClick={() => handleChapterClick(index)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted ${currentChapterIndex === index ? 'bg-muted font-medium' : ''
                                    }`}
                            >
                                <span className="flex-1 text-left truncate">{chapter.title}</span>
                                {chapter.isLocked && (
                                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Reader Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b p-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{currentChapter.title}</h1>
                        {currentChapter.isLocked && (
                            <Badge variant="outline" className="mt-1">
                                <Lock className="mr-1 h-3 w-3" />
                                {currentChapter.requiredTier} Required
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            disabled={currentChapterIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            disabled={currentChapterIndex === chapters.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="max-w-3xl mx-auto p-8">
                        {canAccess ? (
                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                            />
                        ) : (
                            <div className="text-center py-16">
                                <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">This Chapter is Locked</h2>
                                <p className="text-muted-foreground mb-6">
                                    Subscribe to access this content and support the creator
                                </p>
                                <div className="bg-muted p-6 rounded-lg mb-6">
                                    <p className="text-sm italic">
                                        {currentChapter.content.substring(0, 500)}...
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-4">Preview (first 500 characters)</p>
                                </div>
                                <Button size="lg" onClick={() => setPaywallOpen(true)}>
                                    Subscribe to Continue Reading
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Paywall Dialog */}
            <Dialog open={paywallOpen} onOpenChange={setPaywallOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subscription Required</DialogTitle>
                        <DialogDescription>
                            This content requires a subscription to access
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Choose a subscription tier to unlock this biography:</p>
                        <div className="space-y-2">
                            <Button className="w-full" size="lg">
                                Bronze - $9.99/month
                            </Button>
                            <Button className="w-full" size="lg" variant="outline">
                                Gold - $29.99/month
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
