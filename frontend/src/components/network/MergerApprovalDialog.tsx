'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Merger {
    id: string;
    eventTitle: string;
    eventDate: string;
    participants: string[];
}

interface Props {
    merger: Merger;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
}

export function MergerApprovalDialog({ merger, open, onOpenChange, onComplete }: Props) {
    const [narrative, setNarrative] = useState('');
    const [mood, setMood] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!narrative.trim()) {
            toast.error('Please add your narrative');
            return;
        }

        try {
            setSubmitting(true);
            await api.post(`/mergers/${merger.id}/approve`, {
                narrative: narrative.trim(),
                mood: mood || undefined,
            });

            onComplete();
        } catch (error) {
            console.error('Failed to approve merger:', error);
            toast.error('Failed to approve merger');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Your Perspective: {merger.eventTitle}</DialogTitle>
                    <DialogDescription>
                        Share your version of this memory from{' '}
                        {new Date(merger.eventDate).toLocaleDateString()}. Your narrative will be combined with{' '}
                        {merger.participants.length - 1} other{merger.participants.length > 2 ? 's' : ''}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="narrative">Your Narrative *</Label>
                        <Textarea
                            id="narrative"
                            placeholder="Tell your version of this shared memory..."
                            value={narrative}
                            onChange={(e) => setNarrative(e.target.value)}
                            rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            This will be woven together with other perspectives to create a multi-voice story.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mood">Mood (Optional)</Label>
                        <Select value={mood} onValueChange={setMood}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the mood of your memory" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="joyful">Joyful</SelectItem>
                                <SelectItem value="nostalgic">Nostalgic</SelectItem>
                                <SelectItem value="bittersweet">Bittersweet</SelectItem>
                                <SelectItem value="adventurous">Adventurous</SelectItem>
                                <SelectItem value="peaceful">Peaceful</SelectItem>
                                <SelectItem value="intense">Intense</SelectItem>
                                <SelectItem value="reflective">Reflective</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Revenue Sharing</p>
                        <p className="text-xs text-muted-foreground">
                            If this merger is sold, revenue will be split equally among all {merger.participants.length} participants.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Approving...' : 'Approve & Submit'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
