import { create } from 'zustand';
import { chatApi, ChatMessageResponse, RecommendedItem } from '@/lib/api/chat-api-client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendedItems?: RecommendedItem[];
}

interface ChatStore {
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  resetChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionId: null,
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (message: string) => {
    let currentSessionId = get().sessionId;

    if (!currentSessionId) {
      try {
        const response = await chatApi.newSession();
        currentSessionId = response.sessionId;
        set({ sessionId: currentSessionId, error: null });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to start chat session' });
        return;
      }
    }

    set(state => ({
      isLoading: true,
      error: null,
      messages: [...state.messages, { role: 'user' as const, content: message }],
    }));

    try {
      const response: ChatMessageResponse = await chatApi.sendMessage(currentSessionId, message);

      set(state => ({
        isLoading: false,
        messages: [...state.messages, {
          role: 'assistant' as const,
          content: response.message,
          recommendedItems: response.recommendedItems,
        }],
      }));
    } catch (err) {
      set(state => ({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to send message',
        messages: state.messages.slice(0, -1),
      }));
    }
  },

  resetChat: () => {
    const { sessionId } = get();
    if (sessionId) {
      chatApi.endSession(sessionId).catch(() => {});
    }
    set({ sessionId: null, messages: [], error: null, isLoading: false });
  },
}));
