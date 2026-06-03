import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import { connectChat, disconnectChat } from '../../services/chat.socket';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';

import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface Props {
  groupId: number;
}

const GroupChat = ({ groupId }: Props) => {
  const { user } = useAuthStore();
  const { notify } = useNotifications();

  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const currentUserId = user?.id ?? user?.sub ?? 0;

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/student-groups/${groupId}`);
        setGroup(res.data);
      } catch (err: any) {
        setError('Не вдалося завантажити групу');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    socketRef.current = connectChat(token);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('joinGroupRoom', groupId);
    });

    socketRef.current.on('messagesHistory', (history: any[]) => {
      setMessages([...history].reverse());
    });

    socketRef.current.on('newMessage', (msg: any) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.author.id !== currentUserId) {
        const senderName =
          [msg.author.firstName, msg.author.lastName]
            .filter(Boolean).join(' ') || 'Учасник';

        notify({
          title: `👥 ${group?.name ?? 'Група'}`,
          body: `${senderName}: ${msg.content.slice(0, 80)}`,
          tag: `group-chat-${groupId}`,
          onClick: () => {
            window.location.href = '/my-group';
          },
        });
      }
    });

    socketRef.current.on('chatError', (errMsg: string) => {
      setError(errMsg);
    });

    return () => {
      disconnectChat();
    };
  }, [groupId, group, currentUserId, notify]);

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.emit('sendGroupMessage', { groupId, content: message.trim() });
    setMessage('');
  };

  if (loading) return <div className="p-10 text-center">Завантаження чату групи...</div>;
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>;
  if (!group) return <div className="p-10 text-center">Групу не знайдено</div>;

  return (
    <div className="h-full bg-slate-950 flex flex-col rounded-3xl border border-slate-800 overflow-hidden">
      <ChatHeader
        title={`Чат групи ${group.name}`}
        members={group.students?.length || 0}
        subtitle={`Куратор: ${group.curator ? `${group.curator.firstName} ${group.curator.lastName}` : 'Не призначено'}`}
      />
      <ChatMessages messages={messages} currentUserId={currentUserId} />
      <ChatInput value={message} onChange={setMessage} onSend={sendMessage} />
    </div>
  );
};

export default GroupChat;