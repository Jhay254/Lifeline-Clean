'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus, ChevronRight, FileText } from 'lucide-react';

interface Chapter {
    id: string;
    title: string;
    order: number;
}

interface ChapterSidebarProps {
    chapters: Chapter[];
    activeChapterId?: string;
    onChapterSelect: (chapterId: string) => void;
    onNewChapter: () => void;
}

export function ChapterSidebar({
    chapters,
    activeChapterId,
    onChapterSelect,
    onNewChapter,
}: ChapterSidebarProps) {
    return (
        <div className="w-64 border-r bg-background flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg mb-2">Chapters</h2>
                <Button onClick={onNewChapter} className="w-full" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Chapter
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {chapters.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground p-4">
                            No chapters yet. Create your first chapter to get started.
                        </div>
                    ) : (
                        chapters.map((chapter) => (
                            <button
                                key={chapter.id}
                                onClick={() => onChapterSelect(chapter.id)}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                                    'hover:bg-muted',
                                    activeChapterId === chapter.id && 'bg-muted font-medium'
                                )}
                            >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">{chapter.title}</span>
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
