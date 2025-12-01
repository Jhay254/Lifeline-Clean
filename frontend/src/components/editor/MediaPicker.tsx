'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Image as ImageIcon, Check } from 'lucide-react';

interface MediaItem {
    id: string;
    url: string;
    thumbnail: string;
    title: string;
    source: string;
}

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (media: MediaItem) => void;
}

export function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Mock media items
    const mediaItems: MediaItem[] = [
        {
            id: '1',
            url: '/placeholder-1.jpg',
            thumbnail: '/placeholder-1.jpg',
            title: 'Summer Vacation 2023',
            source: 'Instagram',
        },
        // Add more mock items as needed
    ];

    const filteredMedia = mediaItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (item: MediaItem) => {
        setSelectedId(item.id);
    };

    const handleInsert = () => {
        const selected = mediaItems.find((item) => item.id === selectedId);
        if (selected) {
            onSelect(selected);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Media</DialogTitle>
                    <DialogDescription>
                        Choose from your uploaded or synced media
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <ScrollArea className="flex-1">
                        {filteredMedia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No media found. Connect your data sources to import photos.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 p-1">
                                {filteredMedia.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedId === item.id
                                                ? 'border-blue-600 ring-2 ring-blue-200'
                                                : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        {selectedId === item.id && (
                                            <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs truncate">
                                            {item.title}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleInsert} disabled={!selectedId}>
                            Insert Media
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
