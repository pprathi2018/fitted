'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Plus, Sparkles, AlertCircle, Palette } from 'lucide-react';
import { useChatStore, ChatMessage } from '@/lib/stores/chat-store';
import { RecommendedItem } from '@/lib/api/chat-api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { fittedButton } from '@/lib/styles';

const PRESET_POSITIONS: Record<string, { xPercent: number; yPercent: number }> = {
  TOP: { xPercent: 30, yPercent: 5 },
  OUTERWEAR: { xPercent: 25, yPercent: 3 },
  BOTTOM: { xPercent: 30, yPercent: 40 },
  DRESS: { xPercent: 30, yPercent: 5 },
  SHOES: { xPercent: 35, yPercent: 75 },
  ACCESSORY: { xPercent: 65, yPercent: 10 },
};

function RecommendedItemCard({ item }: { item: RecommendedItem }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-fitted-gray-200 p-3">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-16 h-16 object-contain rounded-md bg-fitted-gray-50"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-fitted-gray-900 text-sm truncate">{item.name}</p>
        <p className="text-xs text-fitted-gray-500">{item.type}</p>
        {item.reason && (
          <p className="text-xs text-fitted-gray-600 mt-1 line-clamp-2">{item.reason}</p>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message, onCreateOutfit }: { message: ChatMessage; onCreateOutfit?: (items: RecommendedItem[]) => void }) {
  const isUser = message.role === 'user';
  const hasRecommendations = message.recommendedItems && message.recommendedItems.length > 0;

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-fitted-blue-accent text-white'
          : 'bg-white border border-fitted-gray-200 text-fitted-gray-900'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {hasRecommendations && (
          <>
            <div className="mt-3 space-y-2">
              {message.recommendedItems!.map((item) => (
                <RecommendedItemCard key={item.id} item={item} />
              ))}
            </div>
            <Button
              onClick={() => onCreateOutfit?.(message.recommendedItems!)}
              className={cn(fittedButton({ variant: 'primary', size: 'sm' }), 'mt-3 w-full min-w-0')}
            >
              <Palette size={16} className="mr-2" />
              Add to Outfit Canvas
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-fitted-gray-900 mb-2">Replace Outfit Canvas?</h3>
        <p className="text-sm text-fitted-gray-600 mb-6">
          You have unsaved clothing items on the outfit canvas. Adding these recommended items will replace them.
        </p>
        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} className={cn(fittedButton({ variant: 'secondary', size: 'sm' }))}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className={cn(fittedButton({ variant: 'primary', size: 'sm' }))}>
            Replace
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, error, sendMessage, resetChat } = useChatStore();
  const [input, setInput] = useState('');
  const [pendingItems, setPendingItems] = useState<RecommendedItem[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addItemsToCanvas = (items: RecommendedItem[]) => {
    const typeCounts: Record<string, number> = {};

    const canvasState = items.map((item, index) => {
      const type = item.type.toUpperCase();
      typeCounts[type] = (typeCounts[type] || 0);
      const offset = typeCounts[type] * 8;
      typeCounts[type]++;

      const position = PRESET_POSITIONS[type] || { xPercent: 30, yPercent: 5 };

      return {
        clothingId: item.id,
        clothingItem: {
          id: item.id,
          name: item.name,
          type: item.type,
          modified_image_url: item.imageUrl,
          original_image_url: item.imageUrl,
        },
        xPercent: position.xPercent + offset,
        yPercent: position.yPercent + offset,
        widthPercent: 20,
        heightPercent: 25,
        zIndex: index + 1,
      };
    });

    sessionStorage.setItem('outfitCanvasState', JSON.stringify(canvasState));
    router.push('/outfit');
  };

  const handleCreateOutfit = (items: RecommendedItem[]) => {
    const existingState = sessionStorage.getItem('outfitCanvasState');
    if (existingState) {
      setPendingItems(items);
    } else {
      addItemsToCanvas(items);
    }
  };

  const handleConfirmReplace = () => {
    if (pendingItems) {
      addItemsToCanvas(pendingItems);
      setPendingItems(null);
    }
  };

  const handleCancelReplace = () => {
    setPendingItems(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      {pendingItems && (
        <ConfirmDialog onConfirm={handleConfirmReplace} onCancel={handleCancelReplace} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-fitted-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-fitted-blue-accent" />
          <h1 className="text-lg font-semibold text-fitted-gray-900">AI Stylist</h1>
        </div>
        <Button
          onClick={resetChat}
          className={cn(fittedButton({ variant: 'secondary', size: 'sm' }))}
        >
          <Plus size={16} className="mr-1" />
          New Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-fitted-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles size={48} className="text-fitted-blue-accent/30 mb-4" />
            <h2 className="text-xl font-semibold text-fitted-gray-700 mb-2">
              What would you like to wear?
            </h2>
            <p className="text-fitted-gray-500 max-w-md">
              Ask me for outfit recommendations based on your closet. Try something like
              &quot;What should I wear to a casual dinner?&quot;
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} onCreateOutfit={handleCreateOutfit} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-fitted-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-fitted-blue-accent animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-fitted-blue-accent animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-fitted-blue-accent animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3">
            <AlertCircle size={16} />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-fitted-gray-200 bg-white">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for outfit recommendations..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(fittedButton({ variant: 'primary', size: 'sm' }), 'min-w-0 px-4')}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
