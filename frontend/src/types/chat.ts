export interface ChatMessage {
  id: number;
  content: string;
  createdAt: string;

  author: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}