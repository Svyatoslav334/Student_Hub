export interface ChatMessage {
  id: number;
  content: string;
  createdAt: string;

  author: {
    id: number;

    profile?: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
}