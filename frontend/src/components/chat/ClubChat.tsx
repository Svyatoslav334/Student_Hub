import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import { connectChat, disconnectChat } from '../../services/chat.socket';
import { useAuthStore } from '../../store/authStore';
import type { ChatMessage } from '../../types/chat';
import { useNotifications } from '../../hooks/useNotifications';

import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface Props {
  clubId: number;
}

const ClubChat = ({ clubId }: Props) => {
  const { user } = useAuthStore();
  const { notify } = useNotifications();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [clubs, setClubs] = useState<any[]>([]);
  const [club, setClub] = useState<any>(null);

  const socketRef = useRef<any>(null);
  const currentUserId = user?.id ?? user?.sub ?? 0;

  useEffect(() => {
    fetchData();
  }, [clubId]);

  const fetchData = async () => {
    try {
      const [clubsRes, clubRes] = await Promise.all([
        api.get('/clubs/participated'),
        api.get(`/clubs/${clubId}`),
      ]);
      setClubs(clubsRes.data);
      setClub(clubRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    socketRef.current = connectChat(token);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('joinClubRoom', clubId);
    });

    socketRef.current.on('messagesHistory', (history: ChatMessage[]) => {
      setMessages([...history].reverse());
    });

    socketRef.current.on('newMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);

      
      if (msg.author.id !== currentUserId) {
        const senderName =
          [msg.author.firstName, msg.author.lastName]
            .filter(Boolean).join(' ') || 'Учасник';

        notify({
          title: `💬 ${club?.title ?? 'Гурток'}`,
          body: `${senderName}: ${msg.content.slice(0, 80)}`,
          tag: `club-chat-${clubId}`,
          onClick: () => {
            window.location.href = `/chat/clubs/${clubId}`;
          },
        });
      }
    });

    return () => {
      disconnectChat();
    };
  }, [clubId, club, currentUserId, notify]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit('sendMessage', { clubId, content: message.trim() });
    setMessage('');
  };

  if (!club) {
    return (
      <div className="h-screen bg-slate-950 text-white flex items-center justify-center text-sm">
        Завантаження...
      </div>
    );
  }

  return (
    <div className="h-[90vh] bg-slate-950 flex overflow-hidden rounded-3xl border border-slate-800">
      <div className="hidden lg:flex">
        <ChatSidebar clubs={clubs} currentClubId={clubId} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader title={club.title} members={club.members?.length || 0} />

        <div className="flex-1 min-h-0">
          <ChatMessages messages={messages} currentUserId={currentUserId} />
        </div>

        <ChatInput value={message} onChange={setMessage} onSend={sendMessage} />
      </div>
    </div>
  );
};

export default ClubChat;