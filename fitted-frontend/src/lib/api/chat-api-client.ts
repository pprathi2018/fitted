import { apiClient } from './api-client';

export interface NewSessionResponse {
  sessionId: string;
}

export interface RecommendedItem {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  reason: string;
}

export interface ChatMessageResponse {
  sessionId: string;
  message: string;
  recommendedItems: RecommendedItem[];
}

export class ChatApiService {
  async newSession(): Promise<NewSessionResponse> {
    return apiClient.post<NewSessionResponse>('/api/v1/chat/new');
  }

  async sendMessage(sessionId: string, message: string): Promise<ChatMessageResponse> {
    return apiClient.post<ChatMessageResponse>('/api/v1/chat/message', {
      sessionId,
      message,
    });
  }

  async endSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/chat/session/${sessionId}`);
  }
}

export const chatApi = new ChatApiService();
