'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Maximize2 } from 'lucide-react';

interface AIAssistProps {
    onGenerate?: () => void;
    onRefine?: () => void;
    onExpand?: () => void;
}

export function AIAssist({ onGenerate, onRefine, onExpand }: AIAssistProps) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Assistant
                </CardTitle>
                <CardDescription>
                    Let AI help you write and improve your biography
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onGenerate}
                    disabled={isLoading}
                >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content
                </Button>
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onRefine}
                    disabled={isLoading}
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Refine Selection
                </Button>
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onExpand}
                    disabled={isLoading}
                >
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Expand Section
                </Button>
            </CardContent>
        </Card>
    );
}
