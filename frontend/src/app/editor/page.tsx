'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { ChapterSidebar } from '@/components/editor/ChapterSidebar';
import { AIAssist } from '@/components/editor/AIAssist';
import { MediaPicker } from '@/components/editor/MediaPicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Clock } from 'lucide-react';

interface Chapter {
    id: string;
    title: string;
    order: number;
    content: string;
}

export default function EditorPage() {
    const [chapters, setChapters] = useState<Chapter[]>([
        { id: '1', title: 'Introduction', order: 1, content: '' },
    ]);
    const [activeChapterId, setActiveChapterId] = useState('1');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    const activeChapter = chapters.find((c) => c.id === activeChapterId);

    // Load chapter content when active chapter changes
    useEffect(() => {
        if (activeChapter) {
            setContent(activeChapter.content);
        }
    }, [activeChapterId, activeChapter]);

    // Auto-save functionality
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content !== activeChapter?.content) {
                handleSave();
            }
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(timer);
    }, [content]);

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Implement actual save to backend
        await new Promise((resolve) => setTimeout(resolve, 500));

        setChapters((prev) =>
            prev.map((c) =>
                c.id === activeChapterId ? { ...c, content } : c
            )
        );

        setLastSaved(new Date());
        setIsSaving(false);
    };

    const handleNewChapter = () => {
        const newChapter: Chapter = {
            id: String(chapters.length + 1),
            title: `Chapter ${chapters.length + 1}`,
            order: chapters.length + 1,
            content: '',
        };
        setChapters([...chapters, newChapter]);
        setActiveChapterId(newChapter.id);
    };

    const handleMediaSelect = (media: any) => {
        // TODO: Insert media into editor
        console.log('Selected media:', media);
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
                <ChapterSidebar
                    chapters={chapters}
                    activeChapterId={activeChapterId}
                    onChapterSelect={setActiveChapterId}
                    onNewChapter={handleNewChapter}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Editor Header */}
                    <div className="border-b p-4 flex items-center justify-between bg-background">
                        <div>
                            <h1 className="text-2xl font-bold">{activeChapter?.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {isSaving ? (
                                    <Badge variant="outline" className="text-blue-600">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Saving...
                                    </Badge>
                                ) : lastSaved ? (
                                    <Badge variant="outline" className="text-green-600">
                                        Saved {lastSaved.toLocaleTimeString()}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            <TiptapEditor
                                content={content}
                                onChange={setContent}
                                onImageClick={() => setMediaPickerOpen(true)}
                            />
                        </div>

                        {/* AI Assist Sidebar */}
                        <div className="w-80 border-l p-4 overflow-y-auto">
                            <AIAssist
                                onGenerate={() => console.log('Generate')}
                                onRefine={() => console.log('Refine')}
                                onExpand={() => console.log('Expand')}
                            />
                        </div>
                    </div>
                </div>

                <MediaPicker
                    open={mediaPickerOpen}
                    onClose={() => setMediaPickerOpen(false)}
                    onSelect={handleMediaSelect}
                />
            </div>
        </ProtectedRoute>
    );
}
