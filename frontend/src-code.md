# frontend/src code

## frontend\src\App.css

``css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
````

## frontend\src\App.tsx

``tsx
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <RouterProvider router={router} />;
}

export default App;
````

## frontend\src\components\admin\CategoryModal.tsx

``tsx
import { useState } from 'react';
import { DocumentsAPI } from '../../services/documents.api';

const CategoryModal = ({ categories, onClose, onSuccess }: any) => {
  const [name, setName] = useState('');

  const create = async () => {
    await DocumentsAPI.createCategory({ name });
    setName('');
    onSuccess();
  };

  const remove = async (id: number) => {
    await DocumentsAPI.deleteCategory(id);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-3xl w-[400px]">
        <h2 className="text-xl font-bold mb-3">РљР°С‚РµРіРѕСЂС–С—</h2>

        <div className="flex gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-2 bg-slate-800 rounded"
          />
          <button onClick={create} className="bg-cyan-500 px-3 rounded">
            +
          </button>
        </div>

        <div className="space-y-2">
          {categories.map((c: any) => (
            <div
              key={c.id}
              className="flex justify-between bg-slate-800 p-2 rounded"
            >
              <span>{c.name}</span>
              <button onClick={() => remove(c.id)}>x</button>
            </div>
          ))}
        </div>

        <button className="mt-4 w-full" onClick={onClose}>
          Р—Р°РєСЂРёС‚Рё
        </button>
      </div>
    </div>
  );
};

export default CategoryModal;
````

## frontend\src\components\admin\DocumentModal.tsx

``tsx
import { useState } from 'react';
import { DocumentsAPI } from '../../services/documents.api';

const DocumentModal = ({ onClose, onSuccess, editData, categories }: any) => {
  const [title, setTitle] = useState(editData?.title || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [type, setType] = useState(editData?.type || 'other');
  const [categoryId, setCategoryId] = useState(editData?.category?.id || '');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    try{
        const form = new FormData();

        form.append('title', title);
        form.append('description', description);
        form.append('type', type);
        form.append('categoryId', String(categoryId));

        if (file) form.append('file', file);

        if (editData) {
          await DocumentsAPI.update(editData.id, {
            title,
            description,
            type,
            categoryId,
          });
        } else {
          await DocumentsAPI.create(form);
        }

        onSuccess();
        onClose();
      
    } catch (err: any) {
      console.error('Server error:', err.response?.data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-3xl w-[500px] space-y-3">
        <h2 className="text-xl font-bold">
          {editData ? 'Р РµРґР°РіСѓРІР°С‚Рё' : 'РќРѕРІРёР№ РґРѕРєСѓРјРµРЅС‚'}
        </h2>

        <input
          className="w-full p-2 bg-slate-800 rounded"
          placeholder="РќР°Р·РІР°"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 bg-slate-800 rounded"
          placeholder="РћРїРёСЃ (РјС–РЅС–РјСѓРј 10 СЃРёРјРІРѕР»С–РІ)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {description.length > 0 && description.length < 10 && (
          <p className="text-red-400 text-xs">РњС–РЅС–РјСѓРј 10 СЃРёРјРІРѕР»С–РІ ({description.length}/10)</p>
        )}

        <select
          className="w-full p-2 bg-slate-800 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="template">Template</option>
          <option value="sample">Sample</option>
          <option value="form">Form</option>
          <option value="reference">Reference</option>
          <option value="other">Other</option>
        </select>

        <select
          className="w-full p-2 bg-slate-800 rounded"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Category</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {!editData && (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="bg-cyan-500 px-4 py-2 rounded text-black"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
````

## frontend\src\components\admin\NewsModal.tsx

``tsx
import { useEffect, useState } from 'react';
import api from '../../services/api';

const emptyForm = {
  title: '',
  content: '',
  category: 'ANNOUNCEMENT',
  pinned: false,
};

const NewsModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) => {
  const isEdit = !!initialData;

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        content: initialData.content,
        category: initialData.category,
        pinned: initialData.pinned,
      });

      setPreview(initialData.image || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleImage = (file: File | null) => {
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

const handleSubmit = async () => {
  console.log('FINAL FORM STATE:', form);

  const data = new FormData();

  data.append('title', form.title);
  data.append('content', form.content);
  data.append('category', form.category);
  data.append('pinned', form.pinned ? 'true' : 'false');

  if (image) {
    data.append('image', image);
  }

  await api.patch(`/news/${initialData.id}`, data);

  onSuccess();
  onClose();
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-[900px] max-w-[95%] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold">
              {isEdit ? 'Р РµРґР°РіСѓРІР°РЅРЅСЏ РЅРѕРІРёРЅРё' : 'РЎС‚РІРѕСЂРµРЅРЅСЏ РЅРѕРІРёРЅРё'}
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Р—Р°РїРѕРІРЅС–С‚СЊ РґР°РЅС– С‚Р° РѕРїСѓР±Р»С–РєСѓР№С‚Рµ РєРѕРЅС‚РµРЅС‚
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {isEdit ? 'EDIT MODE' : 'CREATE MODE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          
          <div className="space-y-4">
            
            <div>
              <label className="text-sm text-slate-400">
                Р—Р°РіРѕР»РѕРІРѕРє
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none transition"
                placeholder="Р’РІРµРґС–С‚СЊ Р·Р°РіРѕР»РѕРІРѕРє..."
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                РљРѕРЅС‚РµРЅС‚
              </label>

              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                className="w-full mt-1 px-4 py-3 h-40 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none transition resize-none"
                placeholder="РўРµРєСЃС‚ РЅРѕРІРёРЅРё..."
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                РљР°С‚РµРіРѕСЂС–СЏ
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
              >
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="EVENT">Event</option>
                <option value="EDUCATION">Education</option>
                <option value="ADMINISTRATION">Administration</option>
              </select>
            </div>

            <label className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 cursor-pointer">
              <span className="text-slate-300">
                Р—Р°РєСЂС–РїРёС‚Рё (Pinned)
              </span>

              <input
                type="checkbox"
                checked={!!form.pinned}
                onChange={(e) => {
                  const value = e.target.checked;

                  console.log('PIN CHANGE:', value);

                  setForm((prev) => ({
                    ...prev,
                    pinned: value,
                  }));
                }}
              />
            </label>
          </div>

          <div className="space-y-4">
            
            <div>
              <label className="text-sm text-slate-400">
                Р—РѕР±СЂР°Р¶РµРЅРЅСЏ
              </label>

              <div className="mt-1 border border-dashed border-slate-700 rounded-xl p-4 text-center">
                <input
                  type="file"
                  onChange={(e) =>
                    handleImage(e.target.files?.[0] || null)
                  }
                  className="text-sm"
                />

                {preview && (
                  <img
                    src={preview}
                    className="mt-4 w-full h-48 object-cover rounded-xl border border-slate-700"
                  />
                )}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm text-slate-400 mb-2">
                Preview
              </h3>

              <p className="font-semibold text-white">
                {form.title || 'Р—Р°РіРѕР»РѕРІРѕРє...'}
              </p>

              <p className="text-slate-400 text-sm mt-2 line-clamp-4">
                {form.content || 'РљРѕРЅС‚РµРЅС‚...'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            РЎРєР°СЃСѓРІР°С‚Рё
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition font-medium"
          >
            {isEdit ? 'Р—Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё' : 'РЎС‚РІРѕСЂРёС‚Рё'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
````

## frontend\src\components\chat\ChatHeader.tsx

``tsx
interface Props {
  title: string;
  members: number;
}

const ChatHeader = ({
  title,
  members,
}: Props) => {
  return (
    <div
      className="
        h-14
        border-b border-slate-800
        bg-slate-900
        px-4
        flex items-center justify-between
        shrink-0
      "
    >
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-white truncate">
          {title}
        </h1>

        <p className="text-[11px] text-slate-500 mt-0.5">
          {members} СѓС‡Р°СЃРЅРёРєС–РІ
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;
````

## frontend\src\components\chat\ChatInput.tsx

``tsx
import {
  SendHorizonal,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (
    value: string,
  ) => void;

  onSend: () => void;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
}: Props) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault();

      onSend();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900 p-5">
      <div className="flex gap-4 items-end">
        <textarea
          rows={1}
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value,
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder="РќР°РїРёСЃР°С‚Рё РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ..."
          className="
            flex-1
            resize-none
            rounded-3xl
            bg-slate-800
            border border-slate-700
            px-5 py-4
            text-white
            focus:outline-none
            focus:border-cyan-500
            min-h-[58px]
          "
        />

        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="
            w-14 h-14
            rounded-2xl
            bg-cyan-500
            hover:bg-cyan-400
            disabled:bg-slate-700
            flex items-center justify-center
            transition
          "
        >
          <SendHorizonal
            size={22}
            className="text-black"
          />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
````

## frontend\src\components\chat\ChatMessages.tsx

``tsx
import { useEffect, useRef } from 'react';

import type { ChatMessage } from '../../types/chat';

interface Props {
  messages: ChatMessage[];
  currentUserId: number;
}

const ChatMessages = ({
  messages,
  currentUserId,
}: Props) => {
  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-4 flex flex-col gap-3 min-h-full">
        {messages.map((msg) => {
          const isOwn =
            msg.author.id ===
            currentUserId;

          const name = `
            ${
              msg.author.profile
                ?.firstName || ''
            }
            ${
              msg.author.profile
                ?.lastName || ''
            }
          `.trim();

          return (
            <div
              key={msg.id}
              className={`flex ${
                isOwn
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`
                  max-w-[85%]
                  sm:max-w-[70%]
                  rounded-2xl
                  px-3 py-2.5

                  ${
                    isOwn
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-800 text-white'
                  }
                `}
              >
                {!isOwn && (
                  <p className="text-[11px] opacity-60 mb-1">
                    {name}
                  </p>
                )}

                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>

                <div className="flex justify-end mt-1">
                  <span className="text-[10px] opacity-60">
                    {new Date(
                      msg.createdAt,
                    ).toLocaleTimeString(
                      'uk-UA',
                      {
                        hour: '2-digit',
                        minute:
                          '2-digit',
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
````

## frontend\src\components\chat\ChatSidebar.tsx

``tsx
import { Link } from 'react-router-dom';

import {
  MessageCircle,
} from 'lucide-react';

interface Props {
  clubs: any[];
  currentClubId: number;
}

const ChatSidebar = ({
  clubs,
  currentClubId,
}: Props) => {
  return (
    <div
      className="
        w-[320px]
        border-r border-slate-800
        bg-slate-900
        shrink-0
        overflow-y-auto
      "
    >
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">
          Р§Р°С‚Рё РіСѓСЂС‚РєС–РІ
        </h2>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {clubs.map((club) => {
          const active =
            club.id === currentClubId;

          return (
            <Link
              key={club.id}
              to={`/chat/clubs/${club.id}`}
              className={`
                p-4 rounded-2xl
                transition
                flex items-center gap-4

                ${
                  active
                    ? 'bg-cyan-500 text-black'
                    : 'hover:bg-slate-800 text-white'
                }
              `}
            >
              <div
                className={`
                  w-12 h-12 rounded-2xl
                  flex items-center justify-center
                  ${
                    active
                      ? 'bg-black/20'
                      : 'bg-slate-800'
                  }
                `}
              >
                <MessageCircle
                  size={22}
                />
              </div>

              <div className="min-w-0">
                <p className="font-medium truncate">
                  {club.title}
                </p>

                <p
                  className={`
                    text-sm truncate mt-1
                    ${
                      active
                        ? 'text-black/70'
                        : 'text-slate-500'
                    }
                  `}
                >
                  {club.members?.length || 0}{' '}
                  СѓС‡Р°СЃРЅРёРєС–РІ
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;
````

## frontend\src\components\chat\ClubChat.tsx

``tsx
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { api } from '../../services/api';

import {
  connectChat,
  disconnectChat,
} from '../../services/chat.socket';

import { useAuthStore } from '../../store/authStore';

import type { ChatMessage } from '../../types/chat';

import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface Props {
  clubId: number;
}

const ClubChat = ({
  clubId,
}: Props) => {
  const { user } =
    useAuthStore();

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [message, setMessage] =
    useState('');

  const [clubs, setClubs] =
    useState<any[]>([]);

  const [club, setClub] =
    useState<any>(null);

  const socketRef =
    useRef<any>(null);

  const currentUserId =
    user?.id ??
    user?.sub ??
    0;

  useEffect(() => {
    fetchData();
  }, [clubId]);

  const fetchData = async () => {
    try {
      const [
        clubsRes,
        clubRes,
      ] = await Promise.all([
        api.get(
          '/clubs/participated',
        ),

        api.get(
          `/clubs/${clubId}`,
        ),
      ]);

      setClubs(clubsRes.data);

      setClub(clubRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem(
        'access_token',
      );

    if (!token) return;

    socketRef.current =
      connectChat(token);

    socketRef.current.on(
      'connect',
      () => {
        socketRef.current.emit(
          'joinClubRoom',
          clubId,
        );
      },
    );

    socketRef.current.on(
      'messagesHistory',
      (
        history: ChatMessage[],
      ) => {
        setMessages(
          [...history].reverse(),
        );
      },
    );

    socketRef.current.on(
      'newMessage',
      (
        msg: ChatMessage,
      ) => {
        setMessages((prev) => [
          ...prev,
          msg,
        ]);
      },
    );

    return () => {
      disconnectChat();
    };
  }, [clubId]);

  const sendMessage = () => {
    if (!message.trim())
      return;

    socketRef.current.emit(
      'sendMessage',
      {
        clubId,
        content:
          message.trim(),
      },
    );

    setMessage('');
  };

  if (!club) {
    return (
      <div className="h-screen bg-slate-950 text-white flex items-center justify-center text-sm">
        Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...
      </div>
    );
  }

  return (
    <div className="h-[90vh] bg-slate-950 flex overflow-hidden rounded-3xl border border-slate-800">
      <div className="hidden lg:flex">
        <ChatSidebar
          clubs={clubs}
          currentClubId={clubId}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          title={club.title}
          members={
            club.members
              ?.length || 0
          }
        />

        <div className="flex-1 min-h-0">
          <ChatMessages
            messages={messages}
            currentUserId={
              currentUserId
            }
          />

        </div>

        <ChatInput
          value={message}
          onChange={setMessage}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
};

export default ClubChat;
````

## frontend\src\components\clubs\CreateClubModal.tsx

``tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateClubModal = ({ isOpen, onClose, onSuccess }: CreateClubModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact: '',
    leader: '',           
    schedule: '',         
    meetingTime: '',      
    maxMembers: 20,
  });

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/me');
        const profile = res.data.profile || res.data;
        if (profile) {
          setFormData(prev => ({
            ...prev,
            leader: `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
          }));
        }
      } catch (err) {
        console.error('РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РїСЂРѕС„С–Р»СЊ');
      }
    };

    if (isOpen) fetchProfile();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.contact) {
      alert('Р—Р°РїРѕРІРЅС–С‚СЊ РѕР±РѕРІвЂ™СЏР·РєРѕРІС– РїРѕР»СЏ!');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('contact', formData.contact);
    data.append('leader', formData.leader);
    data.append('schedule', formData.schedule);
    data.append('meetingTime', formData.meetingTime);
    data.append('maxMembers', formData.maxMembers.toString());

    if (image) data.append('image', image);

    try {
      await api.post('/clubs', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Р“СѓСЂС‚РѕРє СѓСЃРїС–С€РЅРѕ СЃС‚РІРѕСЂРµРЅРѕ!');
      onSuccess();
      onClose();
      
      setFormData({
        title: '', description: '', contact: '', leader: '', 
        schedule: '', meetingTime: '', maxMembers: 20
      });
      setImage(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'РџРѕРјРёР»РєР° РїСЂРё СЃС‚РІРѕСЂРµРЅРЅС– РіСѓСЂС‚РєР°');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">РЎС‚РІРѕСЂРёС‚Рё РЅРѕРІРёР№ РіСѓСЂС‚РѕРє</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-auto">
          <div>
            <label className="block text-sm text-slate-400 mb-2">РќР°Р·РІР° РіСѓСЂС‚РєР° *</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РћРїРёСЃ РіСѓСЂС‚РєР° *</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[100px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">РљРµСЂС–РІРЅРёРє (Leader)</label>
              <input type="text" value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">РљРѕРЅС‚Р°РєС‚ *</label>
              <input type="text" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Р РѕР·РєР»Р°Рґ</label>
              <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" placeholder="РџРЅ, РЎСЂ, РџС‚ 18:00" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Р§Р°СЃ Р·СѓСЃС‚СЂС–С‡С–</label>
              <input type="text" value={formData.meetingTime} onChange={e => setFormData({...formData, meetingTime: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" placeholder="18:00 - 20:00" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РњР°РєСЃРёРјР°Р»СЊРЅР° РєС–Р»СЊРєС–СЃС‚СЊ СѓС‡Р°СЃРЅРёРєС–РІ</label>
            <input type="number" min="1" max="40" value={formData.maxMembers} 
              onChange={e => setFormData({...formData, maxMembers: parseInt(e.target.value)})} 
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Р¤РѕС‚Рѕ РіСѓСЂС‚РєР°</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="hidden" id="club-image" />
              <label htmlFor="club-image" className="cursor-pointer text-cyan-400">
                {image ? image.name : 'Р’РёР±СЂР°С‚Рё С„РѕС‚Рѕ'}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800">
              РЎРєР°СЃСѓРІР°С‚Рё
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-2xl">
              {loading ? 'РЎС‚РІРѕСЂРµРЅРЅСЏ...' : 'РЎС‚РІРѕСЂРёС‚Рё РіСѓСЂС‚РѕРє'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClubModal;
````

## frontend\src\components\clubs\EditClubModal.tsx

``tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';

interface EditClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: any;
  onSuccess: () => void;
}

const EditClubModal = ({ isOpen, onClose, club, onSuccess }: EditClubModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact: '',
    maxMembers: 20,
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (club) {
      setFormData({
        title: club.title,
        description: club.description,
        contact: club.contact,
        maxMembers: club.maxMembers || 20,
      });
    }
  }, [club]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('contact', formData.contact);
    data.append('maxMembers', formData.maxMembers.toString());
    if (image) data.append('image', image);

    try {
      await api.patch(`/clubs/${club.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Р“СѓСЂС‚РѕРє СѓСЃРїС–С€РЅРѕ РѕРЅРѕРІР»РµРЅРѕ!');
      onSuccess();
      onClose();
      setImage(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'РџРѕРјРёР»РєР° РїСЂРё СЂРµРґР°РіСѓРІР°РЅРЅС–');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !club) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Р РµРґР°РіСѓРІР°С‚Рё РіСѓСЂС‚РѕРє</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">РќР°Р·РІР° РіСѓСЂС‚РєР°</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РћРїРёСЃ</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[120px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РљРѕРЅС‚Р°РєС‚</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РњР°РєСЃ. СѓС‡Р°СЃРЅРёРєС–РІ</label>
            <input
              type="number"
              min="1"
              max="40"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РќРѕРІРµ С„РѕС‚Рѕ (РЅРµРѕР±РѕРІвЂ™СЏР·РєРѕРІРѕ)</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="hidden"
                id="edit-club-image"
              />
              <label htmlFor="edit-club-image" className="cursor-pointer text-cyan-400">
                {image ? image.name : 'Р’РёР±СЂР°С‚Рё РЅРѕРІРµ С„РѕС‚Рѕ'}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800">
              РЎРєР°СЃСѓРІР°С‚Рё
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold py-4 rounded-2xl"
            >
              {loading ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;
````

## frontend\src\components\layout\AdminLayout.tsx

``tsx
import { Outlet } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;
````

## frontend\src\components\layout\AdminSidebar.tsx

``tsx
import { NavLink } from 'react-router-dom';

import {
  Home,
  Users,
  Newspaper,
  HelpCircle,
  FileText,
  User,
  Shield,
} from 'lucide-react';

const AdminSidebar = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400'
        : 'hover:bg-slate-800'
    }`;

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 min-h-[calc(100vh-64px)] p-4 hidden lg:block">
      <div className="mb-8 px-3 flex items-center gap-3">
        <Shield className="text-cyan-400" />

        <div>
          <h2 className="text-cyan-400 font-semibold text-lg">
            РђРґРјС–РЅ РїР°РЅРµР»СЊ
          </h2>

          <p className="text-slate-500 text-sm">
            System Control
          </p>
        </div>
      </div>

      <nav className="space-y-1">
        <NavLink
          to="/admin"
          end
          className={navClass}
        >
          <Home size={20} />
          Р“РѕР»РѕРІРЅР°
        </NavLink>

        <NavLink
          to="/admin/users"
          className={navClass}
        >
          <Users size={20} />
          РљРѕСЂРёСЃС‚СѓРІР°С‡С–
        </NavLink>

        <NavLink
          to="/admin/news"
          className={navClass}
        >
          <Newspaper size={20} />
          РќРѕРІРёРЅРё
        </NavLink>

        <NavLink
          to="/admin/faq"
          className={navClass}
        >
          <HelpCircle size={20} />
          FAQ
        </NavLink>

        <NavLink
          to="/admin/documents"
          className={navClass}
        >
          <FileText size={20} />
          Р”РѕРєСѓРјРµРЅС‚Рё
        </NavLink>

        <NavLink
          to="/profile"
          className={navClass}
        >
          <User size={20} />
          РџСЂРѕС„С–Р»СЊ
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
````

## frontend\src\components\layout\Footer.tsx

``tsx
const Footer = () => {
  return (
    <footer className="border-t border-slate-800 py-8">
      <div className="mx-auto max-w-7xl px-6 text-center text-slate-400">
        В© 2026 StudentHub. Р’СЃС– РїСЂР°РІР° Р·Р°С…РёС‰РµРЅС–.
      </div>
    </footer>
  )
}

export default Footer
````

## frontend\src\components\layout\Header.tsx

``tsx
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import UserMenu from './UserMenu';

const Header = () => {
  const { isAuthenticated, user } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-2xl font-bold text-cyan-400 transition hover:text-cyan-300"
        >
          StudentHub
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link to="/" className="transition hover:text-cyan-400">
            Р“РѕР»РѕРІРЅР°
          </Link>

          <Link to="/news" className="transition hover:text-cyan-400">
            РќРѕРІРёРЅРё
          </Link>

          <Link to="/teachers" className="transition hover:text-cyan-400">
            Р’РёРєР»Р°РґР°С‡С–
          </Link>

          <Link to="/clubs" className="transition hover:text-cyan-400">
            Р“СѓСЂС‚РєРё
          </Link>

          <Link to="/materials" className="transition hover:text-cyan-400">
            РњР°С‚РµСЂС–Р°Р»Рё
          </Link>

          <Link to="/documents" className="transition hover:text-cyan-400">
            Р”РѕРєСѓРјРµРЅС‚Рё
          </Link>

          <Link to="/faq" className="transition hover:text-cyan-400">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                >
                  Р’С…С–Рґ
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
                >
                  Р РµС”СЃС‚СЂР°С†С–СЏ
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div
        className={`
          overflow-hidden border-t border-slate-800 bg-slate-900 transition-all duration-300 md:hidden
          ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="flex flex-col px-4 py-4">
          <Link
            to="/"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Р“РѕР»РѕРІРЅР°
          </Link>

          <Link
            to="/news"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            РќРѕРІРёРЅРё
          </Link>

          <Link
            to="/teachers"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Р’РёРєР»Р°РґР°С‡С–
          </Link>

          <Link
            to="/clubs"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Р“СѓСЂС‚РєРё
          </Link>

          <Link
            to="/faq"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            FAQ
          </Link>

          <div className="my-4 border-t border-slate-800" />

          {isAuthenticated && user ? (
            <div className="px-2">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center transition hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                Р’С…С–Рґ
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-cyan-500 px-4 py-3 text-center font-semibold text-black transition hover:bg-cyan-400"
                onClick={() => setMobileOpen(false)}
              >
                Р РµС”СЃС‚СЂР°С†С–СЏ
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
````

## frontend\src\components\layout\MainLayout.tsx

``tsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main className="pb-12 min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
````

## frontend\src\components\layout\TeacherLayout.tsx

``tsx
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import Header from './Header';
import Footer from './Footer';

const TeacherLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <div className="flex">
        <TeacherSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherLayout;
````

## frontend\src\components\layout\TeacherSidebar.tsx

``tsx
import { NavLink } from 'react-router-dom';
import { BookOpen, Users, User, Home } from 'lucide-react';

const TeacherSidebar = () => {
  return (
    <div className="w-64 border-r border-slate-800 bg-slate-900 min-h-[calc(100vh-64px)] p-4 hidden lg:block">
      <div className="mb-8 px-3">
        <h2 className="text-cyan-400 font-semibold text-lg">РџР°РЅРµР»СЊ РІРёРєР»Р°РґР°С‡Р°</h2>
      </div>

      <nav className="space-y-1">
        <NavLink
          to="/teacher"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <Home size={20} />
          Р“РѕР»РѕРІРЅР°
        </NavLink>

        <NavLink
          to="/teacher/materials"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <BookOpen size={20} />
          РњРѕС— РјР°С‚РµСЂС–Р°Р»Рё
        </NavLink>

        <NavLink
          to="/teacher/clubs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <Users size={20} />
          РњРѕС— РіСѓСЂС‚РєРё
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <User size={20} />
          РњС–Р№ РїСЂРѕС„С–Р»СЊ
        </NavLink>
      </nav>
    </div>
  );
};

export default TeacherSidebar;
````

## frontend\src\components\layout\UserMenu.tsx

``tsx
import { useState } from 'react';
import { LogOut, User, Users, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const UserMenu = ({ user }: any) => {
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const fullName = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();
  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-2xl bg-slate-800 pl-2 pr-4 py-1.5 hover:bg-slate-700 transition"
      >
        <img
          src={user?.profile?.avatar || '/default-avatar.png'}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border border-slate-700"
        />
        <div className="text-left text-sm hidden md:block">
          <div className="font-medium">{fullName || user?.email}</div>
          <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
        </div>
        <ChevronDown size={18} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-56 z-50">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
              
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} />
                РњС–Р№ РїСЂРѕС„С–Р»СЊ
              </Link>

              {}
              {isTeacher && (
                <Link
                  to="/teacher"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  РџР°РЅРµР»СЊ РІРёРєР»Р°РґР°С‡Р°
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  РџР°РЅРµР»СЊ Р°РґРјС–РЅР°
                </Link>
              )}

              <Link
                to="/my-clubs"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Users size={18} />
                РњРѕС— РіСѓСЂС‚РєРё
              </Link>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-xl text-sm"
              >
                <LogOut size={18} />
                Р’РёР№С‚Рё Р· Р°РєР°СѓРЅС‚Сѓ
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
````

## frontend\src\components\materials\AddMaterialModal.tsx

``tsx
import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '../../services/api';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const materialTypes = [
  { value: 'lecture', label: 'Р›РµРєС†С–СЏ' },
  { value: 'presentation', label: 'РџСЂРµР·РµРЅС‚Р°С†С–СЏ' },
  { value: 'methodical', label: 'РњРµС‚РѕРґРёС‡РЅС– РјР°С‚РµСЂС–Р°Р»Рё' },
  { value: 'other', label: 'Р†РЅС€Рµ' },
];

const AddMaterialModal = ({ isOpen, onClose, onSuccess }: AddMaterialModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lecture',
    categoryId: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return;

      setCategoriesLoading(true);
      try {
        const res = await api.get('/material-categories');
        setCategories(res.data);

        if (res.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            categoryId: String(res.data[0].id)
          }));
        }
      } catch (err) {
        console.error('РџРѕРјРёР»РєР° Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РєР°С‚РµРіРѕСЂС–Р№:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.categoryId || !file) {
      alert('Р—Р°РїРѕРІРЅС–С‚СЊ СѓСЃС– РѕР±РѕРІвЂ™СЏР·РєРѕРІС– РїРѕР»СЏ С‚Р° РѕР±РµСЂС–С‚СЊ С„Р°Р№Р»!');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('categoryId', formData.categoryId);
    data.append('file', file);

    try {
      await api.post('/materials', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('РњР°С‚РµСЂС–Р°Р» СѓСЃРїС–С€РЅРѕ РґРѕРґР°РЅРѕ!');
      onSuccess();
      onClose();

      setFormData({
        title: '',
        description: '',
        type: 'lecture',
        categoryId: '',
      });
      setFile(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'РџРѕРјРёР»РєР° РїСЂРё РґРѕРґР°РІР°РЅРЅС– РјР°С‚РµСЂС–Р°Р»Сѓ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Р”РѕРґР°С‚Рё РЅРѕРІРёР№ РјР°С‚РµСЂС–Р°Р»</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-auto max-h-[calc(95vh-80px)]"
        >
          <div>
            <label className="block text-sm text-slate-400 mb-2">РќР°Р·РІР° РјР°С‚РµСЂС–Р°Р»Сѓ</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
              placeholder="Р’СЃС‚СѓРї РґРѕ React"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РћРїРёСЃ</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[100px] focus:outline-none focus:border-cyan-500"
              placeholder="РљРѕСЂРѕС‚РєРёР№ РѕРїРёСЃ РјР°С‚РµСЂС–Р°Р»Сѓ..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">РўРёРї РјР°С‚РµСЂС–Р°Р»Сѓ</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
              >
                {materialTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">РљР°С‚РµРіРѕСЂС–СЏ</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                required
                disabled={categoriesLoading}
              >
                {categoriesLoading ? (
                  <option>Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РєР°С‚РµРіРѕСЂС–Р№...</option>
                ) : categories.length === 0 ? (
                  <option>РќРµРјР°С” РґРѕСЃС‚СѓРїРЅРёС… РєР°С‚РµРіРѕСЂС–Р№</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Р¤Р°Р№Р» РјР°С‚РµСЂС–Р°Р»Сѓ</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-cyan-500 transition-colors">
              <Upload size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-300 mb-1">РџРµСЂРµС‚СЏРіРЅС–С‚СЊ С„Р°Р№Р» Р°Р±Рѕ РЅР°С‚РёСЃРЅС–С‚СЊ РґР»СЏ РІРёР±РѕСЂСѓ</p>
              <p className="text-xs text-slate-500 mb-4">PDF, PPT, DOCX, ZIP С‚Р° С–РЅС€С– С„РѕСЂРјР°С‚Рё</p>

              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl cursor-pointer text-sm transition"
              >
                {file ? file.name : 'Р’РёР±СЂР°С‚Рё С„Р°Р№Р»'}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800 transition"
            >
              РЎРєР°СЃСѓРІР°С‚Рё
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-2xl transition"
            >
              {loading ? 'Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...' : 'РћРїСѓР±Р»С–РєСѓРІР°С‚Рё РјР°С‚РµСЂС–Р°Р»'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;
````

## frontend\src\components\materials\EditMaterialModal.tsx

``tsx
import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '../../services/api';

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: any;
  onSuccess: () => void;
}

const materialTypes = [
  { value: 'lecture', label: 'Р›РµРєС†С–СЏ' },
  { value: 'presentation', label: 'РџСЂРµР·РµРЅС‚Р°С†С–СЏ' },
  { value: 'methodical', label: 'РњРµС‚РѕРґРёС‡РЅС– РјР°С‚РµСЂС–Р°Р»Рё' },
  { value: 'other', label: 'Р†РЅС€Рµ' },
];

const EditMaterialModal = ({ isOpen, onClose, material, onSuccess }: EditMaterialModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lecture',
    categoryId: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (material && isOpen) {
      setFormData({
        title: material.title,
        description: material.description,
        type: material.type,
        categoryId: material.category?.id?.toString() || '',
      });
    }
  }, [material, isOpen]);

  
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return;
      setCategoriesLoading(true);
      try {
        const res = await api.get('/material-categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.categoryId) {
        alert('Р—Р°РїРѕРІРЅС–С‚СЊ РѕР±РѕРІвЂ™СЏР·РєРѕРІС– РїРѕР»СЏ!');
        return;
    }

    setLoading(true);
    const formDataToSend = new FormData();

    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('type', formData.type);           
    formDataToSend.append('categoryId', formData.categoryId);

    if (file) {
        formDataToSend.append('file', file);
    }

    try {
        await api.patch(`/materials/${material.id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });

        alert('РњР°С‚РµСЂС–Р°Р» СѓСЃРїС–С€РЅРѕ РѕРЅРѕРІР»РµРЅРѕ!');
        onSuccess();
        onClose();
        setFile(null);
    } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || 'РџРѕРјРёР»РєР° РїСЂРё РѕРЅРѕРІР»РµРЅРЅС– РјР°С‚РµСЂС–Р°Р»Сѓ');
    } finally {
        setLoading(false);
    }
    };

  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Р РµРґР°РіСѓРІР°С‚Рё РјР°С‚РµСЂС–Р°Р»</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-auto max-h-[calc(95vh-80px)]">
          <div>
            <label className="block text-sm text-slate-400 mb-2">РќР°Р·РІР° РјР°С‚РµСЂС–Р°Р»Сѓ</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РћРїРёСЃ</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[100px] focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">РўРёРї РјР°С‚РµСЂС–Р°Р»Сѓ</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
              >
                {materialTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">РљР°С‚РµРіРѕСЂС–СЏ</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">РќРѕРІРёР№ С„Р°Р№Р» (РЅРµРѕР±РѕРІвЂ™СЏР·РєРѕРІРѕ)</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <Upload size={40} className="mx-auto text-slate-500 mb-3" />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="edit-file"
              />
              <label htmlFor="edit-file" className="cursor-pointer text-cyan-400 hover:text-cyan-300">
                {file ? file.name : 'Р’РёР±СЂР°С‚Рё РЅРѕРІРёР№ С„Р°Р№Р»'}
              </label>
            </div>
            {material.file && !file && (
              <p className="text-xs text-slate-500 mt-2">РџРѕС‚РѕС‡РЅРёР№ С„Р°Р№Р»: {material.originalFileName}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800"
            >
              РЎРєР°СЃСѓРІР°С‚Рё
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold py-4 rounded-2xl"
            >
              {loading ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaterialModal;
````

## frontend\src\index.css

``css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;

  background: #0f172a;
  color: white;

  font-family: Inter, sans-serif;
}
````

## frontend\src\main.tsx

``tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
````

## frontend\src\pages\admin\AdminDashboard.tsx

``tsx
import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Newspaper,
  HelpCircle,
  FileText,
  GraduationCap,
  Shield,
  Activity,
} from 'lucide-react';

import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    materials: 0,
    news: 0,
    clubs: 0,
    faq: 0,
    documents: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [
        usersRes,
        materialsRes,
        newsRes,
        clubsRes,
        faqRes,
        documentsRes,
      ] = await Promise.all([
        api.get('/users'),
        api.get('/materials'),
        api.get('/news'),
        api.get('/clubs'),
        api.get('/faq'),
        api.get('/documents'),
      ]);

      setStats({
        users:
          usersRes.data.items?.length ||
          usersRes.data.length ||
          0,

        materials:
          materialsRes.data.items?.length ||
          materialsRes.data.length ||
          0,

        news:
          newsRes.data.items?.length ||
          newsRes.data.length ||
          0,

        clubs:
          clubsRes.data.items?.length ||
          clubsRes.data.length ||
          0,

        faq:
          faqRes.data.items?.length ||
          faqRes.data.length ||
          0,

        documents:
          documentsRes.data.items?.length ||
          documentsRes.data.length ||
          0,
      });
    } catch (err) {
      console.error('РџРѕРјРёР»РєР° Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ СЃС‚Р°С‚РёСЃС‚РёРєРё', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'РљРѕСЂРёСЃС‚СѓРІР°С‡С–РІ',
      value: stats.users,
      icon: Users,
      color: 'cyan',
    },
    {
      title: 'РњР°С‚РµСЂС–Р°Р»С–РІ',
      value: stats.materials,
      icon: BookOpen,
      color: 'purple',
    },
    {
      title: 'РќРѕРІРёРЅ',
      value: stats.news,
      icon: Newspaper,
      color: 'emerald',
    },
    {
      title: 'Р“СѓСЂС‚РєС–РІ',
      value: stats.clubs,
      icon: GraduationCap,
      color: 'orange',
    },
    {
      title: 'FAQ',
      value: stats.faq,
      icon: HelpCircle,
      color: 'pink',
    },
    {
      title: 'Р”РѕРєСѓРјРµРЅС‚С–РІ',
      value: stats.documents,
      icon: FileText,
      color: 'yellow',
    },
  ];

  return (
    <div>
      
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="text-cyan-400" size={38} />

          <h1 className="text-4xl font-bold">
            РџР°РЅРµР»СЊ Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂР°
          </h1>
        </div>

        <p className="text-slate-400 text-lg">
          РљРµСЂСѓР№С‚Рµ РІСЃС–С”СЋ СЃРёСЃС‚РµРјРѕСЋ, РєРѕСЂРёСЃС‚СѓРІР°С‡Р°РјРё С‚Р° РєРѕРЅС‚РµРЅС‚РѕРј
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/40 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 mb-2">
                    {card.title}
                  </p>

                  <h3 className="text-4xl font-bold">
                    {loading ? '...' : card.value}
                  </h3>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Icon
                    size={30}
                    className="text-cyan-400"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-cyan-400" />
          <h2 className="text-2xl font-semibold">
            РЁРІРёРґРєС– РґС–С—
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <Users
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              РљРѕСЂРёСЃС‚СѓРІР°С‡С–
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              РџРµСЂРµРіР»СЏРґ, СЂРµРґР°РіСѓРІР°РЅРЅСЏ С‚Р° Р±Р»РѕРєСѓРІР°РЅРЅСЏ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ
            </p>
          </Link>

          <Link
            to="/admin/materials"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <BookOpen
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              РњР°С‚РµСЂС–Р°Р»Рё
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              РЈРїСЂР°РІР»С–РЅРЅСЏ РЅР°РІС‡Р°Р»СЊРЅРёРјРё РјР°С‚РµСЂС–Р°Р»Р°РјРё
            </p>
          </Link>

          <Link
            to="/admin/news"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <Newspaper
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              РќРѕРІРёРЅРё
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              РЎС‚РІРѕСЂРµРЅРЅСЏ С‚Р° СЂРµРґР°РіСѓРІР°РЅРЅСЏ РЅРѕРІРёРЅ
            </p>
          </Link>

          <Link
            to="/admin/clubs"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <GraduationCap
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              Р“СѓСЂС‚РєРё
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              РЈРїСЂР°РІР»С–РЅРЅСЏ СЃС‚СѓРґРµРЅС‚СЃСЊРєРёРјРё РіСѓСЂС‚РєР°РјРё
            </p>
          </Link>

          <Link
            to="/admin/faq"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <HelpCircle
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              FAQ
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Р’С–РґРїРѕРІС–РґС– РЅР° РїРёС‚Р°РЅРЅСЏ СЃС‚СѓРґРµРЅС‚С–РІ
            </p>
          </Link>

          <Link
            to="/admin/documents"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <FileText
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              Р”РѕРєСѓРјРµРЅС‚Рё
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              РЈРїСЂР°РІР»С–РЅРЅСЏ С€Р°Р±Р»РѕРЅР°РјРё С‚Р° С„Р°Р№Р»Р°РјРё
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
````

## frontend\src\pages\admin\AdminDocuments.tsx

``tsx
import { useEffect, useState } from 'react';
import { DocumentsAPI } from '../../services/documents.api';

import { Plus, Trash, Pencil, File } from 'lucide-react';
import DocumentModal from '../../components/admin/DocumentModal';
import CategoryModal from '../../components/admin/CategoryModal';


const AdminDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [docs, cats] = await Promise.all([
        DocumentsAPI.getAll({ page: 1, limit: 50 }),
        DocumentsAPI.getCategories(),
      ]);

      setDocuments(docs.data.items);
      setCategories(cats.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Р’РёРґР°Р»РёС‚Рё РґРѕРєСѓРјРµРЅС‚?')) return;

    await DocumentsAPI.remove(id);
    fetchData();
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Р”РѕРєСѓРјРµРЅС‚Рё</h1>
          <p className="text-slate-400">
            РЈРїСЂР°РІР»С–РЅРЅСЏ С„Р°Р№Р»Р°РјРё, С€Р°Р±Р»РѕРЅР°РјРё С– С„РѕСЂРјР°РјРё
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenCategoryModal(true)}
            className="px-4 py-2 bg-slate-800 rounded-xl"
          >
            РљР°С‚РµРіРѕСЂС–С—
          </button>

          <button
            onClick={() => {
              setEditDoc(null);
              setOpenModal(true);
            }}
            className="px-4 py-2 bg-cyan-500 text-black rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Р”РѕРґР°С‚Рё
          </button>
        </div>
      </div>

      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        {loading ? (
          <p className="text-slate-400">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl"
              >
                <div>
                  <h3 className="font-semibold">{doc.title}</h3>

                  <p className="text-sm text-slate-400">
                    {doc.category?.name} вЂў {doc.type}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  {doc.file && (
                    <a
                      href={doc.file}
                      target="_blank"
                      className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"
                    >
                      <File size={18} />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setEditDoc(doc);
                      setOpenModal(true);
                    }}
                    className="p-2 bg-yellow-500/10 text-yellow-400 rounded-xl"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-xl"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {openModal && (
        <DocumentModal
          onClose={() => setOpenModal(false)}
          onSuccess={fetchData}
          editData={editDoc}
          categories={categories}
        />
      )}

      {openCategoryModal && (
        <CategoryModal
          onClose={() => setOpenCategoryModal(false)}
          categories={categories}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default AdminDocuments;
````

## frontend\src\pages\admin\AdminFaq.tsx

``tsx
import { useEffect, useState } from 'react';
import { Plus, Trash, Pencil } from 'lucide-react';
import { faqApi } from '../../services/faqApi.service';

const emptyForm = {
  question: '',
  answer: '',
  category: 'OTHER',
  isPublished: true,
};

const AdminFaq = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadFaq();
  }, []);

  const loadFaq = async () => {
    setLoading(true);
    try {
      const res = await faqApi.getAll({
        showUnpublished: true,
        limit: 50,
      });

      setItems(res.data.items);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await faqApi.update(editingId, form);
      } else {
        await faqApi.create(form);
      }

      resetForm();
      loadFaq();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      isPublished: item.isPublished,
    });

    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Р’РёРґР°Р»РёС‚Рё FAQ?')) return;

    await faqApi.remove(id);
    loadFaq();
  };

  const togglePublish = async (item: any) => {
    try {
      const payload = {
        question: item.question,
        answer: item.answer,
        category: item.category ?? 'OTHER',
        isPublished: !item.isPublished,
      };

      await faqApi.update(item.id, payload);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, isPublished: !i.isPublished }
            : i
        )
      );
    } catch (err: any) {
      console.log('ERROR MESSAGE:', err.message);
    }
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">FAQ</h1>
          <p className="text-slate-400">
            РђРґРјС–РЅС–СЃС‚СЂСѓРІР°РЅРЅСЏ РїРёС‚Р°РЅСЊ
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Р”РѕРґР°С‚Рё
        </button>
      </div>

      
      {showForm && (
        <div className="bg-slate-900 p-6 rounded-2xl mb-6 border border-slate-800">
          <input
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            placeholder="РџРёС‚Р°РЅРЅСЏ"
            value={form.question}
            onChange={(e) =>
              setForm({ ...form, question: e.target.value })
            }
          />

          <textarea
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            placeholder="Р’С–РґРїРѕРІС–РґСЊ"
            value={form.answer}
            onChange={(e) =>
              setForm({ ...form, answer: e.target.value })
            }
          />

          <select
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          >
            <option value="ADMISSION">ADMISSION</option>
            <option value="DOCUMENTS">DOCUMENTS</option>
            <option value="STUDIES">STUDIES</option>
            <option value="SCHEDULE">SCHEDULE</option>
            <option value="CLUBS">CLUBS</option>
            <option value="TEACHERS">TEACHERS</option>
            <option value="OTHER">OTHER</option>
          </select>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="bg-cyan-500 px-4 py-2 rounded-xl"
            >
              {editingId ? 'РћРЅРѕРІРёС‚Рё' : 'РЎС‚РІРѕСЂРёС‚Рё'}
            </button>

            <button
              onClick={resetForm}
              className="bg-slate-700 px-4 py-2 rounded-xl"
            >
              РЎРєР°СЃСѓРІР°С‚Рё
            </button>
          </div>
        </div>
      )}

      
      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...</p>
        ) : (
          items.map((item: any) => (
            <div
              key={item.id}
              className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between"
            >
              
              <div>
                <h3 className="font-semibold">
                  {item.question}
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                  {item.answer || 'вЂ” РЅРµРјР°С” РІС–РґРїРѕРІС–РґС– вЂ”'}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">
                    {item.category}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.isPublished
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {item.isPublished
                      ? 'published'
                      : 'draft'}
                  </span>

                  
                  <button
                    onClick={() => togglePublish(item)}
                    className={`text-xs px-2 py-1 rounded-lg border transition ${
                      item.isPublished
                        ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                        : 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10'
                    }`}
                  >
                    Toggle
                  </button>
                </div>
              </div>

              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 hover:bg-slate-800 rounded-lg"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFaq;
````

## frontend\src\pages\admin\AdminNews.tsx

``tsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Edit, Plus } from 'lucide-react';
import NewsModal from '../../components/admin/NewsModal';

const AdminNews = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/news?limit=100');
      setNews(res.data.items);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const deleteNews = async (id: number) => {
    if (!confirm('Р’РёРґР°Р»РёС‚Рё РЅРѕРІРёРЅСѓ?')) return;

    await api.delete(`/news/${id}`);
    fetchNews();
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">РќРѕРІРёРЅРё</h1>
          <p className="text-slate-400">
            CRUD РєРµСЂСѓРІР°РЅРЅСЏ РЅРѕРІРёРЅР°РјРё
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-2xl flex items-center gap-2"
        >
          <Plus size={18} />
          РЎС‚РІРѕСЂРёС‚Рё
        </button>
      </div>

      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead className="text-left text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">ID</th>
              <th>Р—Р°РіРѕР»РѕРІРѕРє</th>
              <th>РљР°С‚РµРіРѕСЂС–СЏ</th>
              <th>Pinned</th>
              <th>Р”Р°С‚Р°</th>
              <th className="text-right p-4">Р”С–С—</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4">
                  Loading...
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-4">{item.id}</td>

                  <td className="font-medium">
                    {item.title}
                  </td>

                  <td className="text-slate-400">
                    {item.category}
                  </td>

                  <td>{item.pinned ? 'рџ“Њ' : ''}</td>

                  <td className="text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-yellow-400"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() =>
                          deleteNews(item.id)
                        }
                        className="text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      <NewsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchNews}
        initialData={editItem}
      />
    </div>
  );
};

export default AdminNews;
````

## frontend\src\pages\admin\AdminUsers.tsx

``tsx
import { useEffect, useState } from 'react';

import {
  Search,
  Shield,
  User,
  GraduationCap,
  Trash2,
  Edit,
} from 'lucide-react';

import { api } from '../../services/api';

interface IUser {
  id: number;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');


  const [editingUser, setEditingUser] =
  useState<IUser | null>(null);

    const [editForm, setEditForm] =
    useState({
        firstName: '',
        lastName: '',
        email: '',
    });
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get('/users');

      setUsers(
        res.data.items ||
          res.data ||
          []
      );
    } catch (err) {
      console.error(
        'РџРѕРјРёР»РєР° Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ',
        err
      );
    } finally {
      setLoading(false);
    }
  };

    const openEditModal = (
    user: IUser
    ) => {
    const names =
        user.fullName.split(' ');

    setEditingUser(user);

    setEditForm({
        firstName: names[0] || '',
        lastName: names[1] || '',
        email: user.email,
    });
    };

  const handleDelete = async (
    id: number
  ) => {
    const confirmDelete =
      window.confirm(
        'Р’РёРґР°Р»РёС‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°?'
      );

    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${id}`);

      setUsers((prev) =>
        prev.filter(
          (user) => user.id !== id
        )
      );
    } catch (err) {
      console.error(
        'РџРѕРјРёР»РєР° РІРёРґР°Р»РµРЅРЅСЏ',
        err
      );
    }
  };

  const handleRoleChange = async (
    id: number,
    role: string
  ) => {
    try {
      await api.patch(
        `/users/${id}/role`,
        {
          role,
        }
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                role:
                  role as IUser['role'],
              }
            : user
        )
      );
    } catch (err) {
      console.error(
        'РџРѕРјРёР»РєР° Р·РјС–РЅРё СЂРѕР»С–',
        err
      );
    }
  };

  const filteredUsers =
    users.filter((user) =>
      `${user.fullName} ${user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const getRoleBadge = (
    role: string
  ) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';

      case 'TEACHER':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';

      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  const handleSaveEdit =
  async () => {
    if (!editingUser) return;

    try {
      await api.put(
        `/users/${editingUser.id}`,
        editForm
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id ===
          editingUser.id
            ? {
                ...user,
                fullName: `${editForm.firstName} ${editForm.lastName}`,
                email:
                  editForm.email,
              }
            : user
        )
      );

      setEditingUser(null);
    } catch (err) {
      console.error(
        'РџРѕРјРёР»РєР° СЂРµРґР°РіСѓРІР°РЅРЅСЏ',
        err
      );
    }
  };

  return (
    <div>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            РљРѕСЂРёСЃС‚СѓРІР°С‡С–
          </h1>

          <p className="text-slate-400">
            РЈРїСЂР°РІР»С–РЅРЅСЏ СЃС‚СѓРґРµРЅС‚Р°РјРё,
            РІРёРєР»Р°РґР°С‡Р°РјРё С‚Р°
            Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂР°РјРё
          </p>
        </div>

        
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />

          <input
            type="text"
            placeholder="РџРѕС€СѓРє РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 w-full lg:w-80 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  РљРѕСЂРёСЃС‚СѓРІР°С‡
                </th>

                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  Email
                </th>

                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  Р РѕР»СЊ
                </th>

                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  Р”Р°С‚Р°
                </th>

                <th className="text-right px-6 py-4 font-medium text-slate-300">
                  Р”С–С—
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-slate-400"
                  >
                    Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...
                  </td>
                </tr>
              ) : filteredUsers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-slate-400"
                  >
                    РљРѕСЂРёСЃС‚СѓРІР°С‡С–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ
                  </td>
                </tr>
              ) : (
                filteredUsers.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                    >
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                            <User
                              className="text-cyan-400"
                              size={20}
                            />
                          </div>

                          <div>
                            <p className="font-medium">
                              {
                                user.fullName
                              }
                            </p>

                            <p className="text-sm text-slate-500">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      
                      <td className="px-6 py-5 text-slate-300">
                        {user.email}
                      </td>

                      
                      <td className="px-6 py-5">
                        <select
                          value={user.role}
                          onChange={(
                            e
                          ) =>
                            handleRoleChange(
                              user.id,
                              e.target.value
                            )
                          }
                          className={`px-3 py-2 rounded-xl text-sm font-medium bg-slate-950 ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          <option value="STUDENT">
                            STUDENT
                          </option>

                          <option value="TEACHER">
                            TEACHER
                          </option>

                          <option value="ADMIN">
                            ADMIN
                          </option>
                        </select>
                      </td>

                      
                      <td className="px-6 py-5 text-slate-400 text-sm">
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString()}
                      </td>

                      
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                                openEditModal(user)
                            }
                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                            >
                            <Edit
                              size={18}
                            />
                          </button>
                            {editingUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md">
                                <h2 className="text-2xl font-bold mb-6">
                                    Р РµРґР°РіСѓРІР°РЅРЅСЏ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°
                                </h2>

                                <div className="space-y-4">
                                    <input
                                    type="text"
                                    placeholder="Р†Рј'СЏ"
                                    value={editForm.firstName}
                                    onChange={(e) =>
                                        setEditForm({
                                        ...editForm,
                                        firstName:
                                            e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
                                    />

                                    <input
                                    type="text"
                                    placeholder="РџСЂС–Р·РІРёС‰Рµ"
                                    value={editForm.lastName}
                                    onChange={(e) =>
                                        setEditForm({
                                        ...editForm,
                                        lastName:
                                            e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
                                    />

                                    <input
                                    type="email"
                                    placeholder="Email"
                                    value={editForm.email}
                                    onChange={(e) =>
                                        setEditForm({
                                        ...editForm,
                                        email:
                                            e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                    onClick={() =>
                                        setEditingUser(null)
                                    }
                                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 transition"
                                    >
                                    РЎРєР°СЃСѓРІР°С‚Рё
                                    </button>

                                    <button
                                    onClick={handleSaveEdit}
                                    className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
                                    >
                                    Р—Р±РµСЂРµРіС‚Рё
                                    </button>
                                </div>
                                </div>
                            </div>
                            )}
                          <button
                            onClick={() =>
                              handleDelete(
                                user.id
                              )
                            }
                            className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>


  );
};

export default AdminUsers;
````

## frontend\src\pages\auth\Login.tsx

``tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService, type LoginDto } from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(formData);
            await useAuthStore.getState().login(response.access_token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'РќРµРІС–СЂРЅРёР№ email Р°Р±Рѕ РїР°СЂРѕР»СЊ');
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-cyan-400">StudentHub</h1>
          <p className="text-slate-400 mt-2">РЈРІС–Р№РґС–С‚СЊ Сѓ СЃРІС–Р№ Р°РєР°СѓРЅС‚</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">РџР°СЂРѕР»СЊ</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                placeholder="вЂўвЂўвЂўвЂўвЂўвЂўвЂўвЂў"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition disabled:opacity-70"
            >
              {loading ? 'Р’С…С–Рґ...' : 'РЈРІС–Р№С‚Рё'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            РќРµРјР°С” Р°РєР°СѓРЅС‚Сѓ?{' '}
            <Link to="/register" className="text-cyan-400 hover:underline">
              Р—Р°СЂРµС”СЃС‚СЂСѓРІР°С‚РёСЃСЏ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
````

## frontend\src\pages\auth\Register.tsx

``tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, type RegisterDto } from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState<RegisterDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'STUDENT',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(formData);
      alert('Р РµС”СЃС‚СЂР°С†С–СЏ СѓСЃРїС–С€РЅР°! РўРµРїРµСЂ СѓРІС–Р№РґС–С‚СЊ.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'РџРѕРјРёР»РєР° СЂРµС”СЃС‚СЂР°С†С–С—');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Р РµС”СЃС‚СЂР°С†С–СЏ</h1>
          <p className="text-slate-400 mt-2">РЎС‚РІРѕСЂС–С‚СЊ РЅРѕРІРёР№ Р°РєР°СѓРЅС‚</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Р†Рј'СЏ</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">РџСЂС–Р·РІРёС‰Рµ</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">РџР°СЂРѕР»СЊ</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">РўРµР»РµС„РѕРЅ (РЅРµРѕР±РѕРІ'СЏР·РєРѕРІРѕ)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Р РµС”СЃС‚СЂР°С†С–СЏ...' : 'Р—Р°СЂРµС”СЃС‚СЂСѓРІР°С‚РёСЃСЏ'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Р’Р¶Рµ РјР°С”С‚Рµ Р°РєР°СѓРЅС‚?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline">
              РЈРІС–Р№С‚Рё
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
````

## frontend\src\pages\clubs\ClubChatPage.tsx

``tsx
import { useParams } from 'react-router-dom';

import ClubChat from '../../components/chat/ClubChat';

const ClubChatPage = () => {
  const { id } = useParams();

  return (
    <div className="h-screen">
      <ClubChat
        clubId={Number(id)}
      />
    </div>
  );
};

export default ClubChatPage;
````

## frontend\src\pages\clubs\ClubDetail.tsx

``tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

import { 
  ArrowLeft, 
  Users, 
  User, 
  Clock, 
  Calendar 
} from 'lucide-react';

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();

  const [club, setClub] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/clubs/${id}`);
      const clubData = res.data;
      
      // Р¤С–РєСЃ РєС–Р»СЊРєРѕСЃС‚С– СѓС‡Р°СЃРЅРёРєС–РІ
      const memberCount = clubData.members?.length ?? clubData.currentMembers ?? 0;
      
      setClub({
        ...clubData,
        currentMembers: memberCount
      });
      
      setIsMember(clubData.members?.some((m: any) => m.id === user?.id) || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      alert("РЈРІС–Р№РґС–С‚СЊ, С‰РѕР± РїСЂРёС”РґРЅР°С‚РёСЃСЏ РґРѕ РіСѓСЂС‚РєР°");
      return;
    }
    setJoining(true);
    try {
      await api.post(`/clubs/${id}/join`);
      alert("Р’Рё РїСЂРёС”РґРЅР°Р»РёСЃСЏ РґРѕ РіСѓСЂС‚РєР°!");
      fetchClub(); // РѕРЅРѕРІР»СЋС”РјРѕ РґР°РЅС–
    } catch (err: any) {
      alert(err.response?.data?.message || "РќРµ РІРґР°Р»РѕСЃСЏ РїСЂРёС”РґРЅР°С‚РёСЃСЏ");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setJoining(true);
    try {
      await api.delete(`/clubs/${id}/leave`);
      alert("Р’Рё РІРёР№С€Р»Рё Р· РіСѓСЂС‚РєР°");
      fetchClub();
    } catch (err: any) {
      alert(err.response?.data?.message || "РџРѕРјРёР»РєР°");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="text-center py-20">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...</div>;
  if (!club) return <div className="text-center py-20">Р“СѓСЂС‚РѕРє РЅРµ Р·РЅР°Р№РґРµРЅРѕ</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 text-base"
        >
          <ArrowLeft size={18} />
          РќР°Р·Р°Рґ РґРѕ РіСѓСЂС‚РєС–РІ
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {club.image && (
            <img
              src={club.image}
              alt={club.title}
              className="w-full h-72 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold leading-tight">{club.title}</h1>
                <p className="text-cyan-400 mt-1">РЎС‚СѓРґРµРЅС‚СЃСЊРєРёР№ РіСѓСЂС‚РѕРє</p>
              </div>

              <div className="bg-slate-800 rounded-2xl px-4 py-2 text-center flex-shrink-0">
                <div className="text-lg font-semibold">{club.currentMembers}</div>
                <div className="text-xs text-slate-400">СѓС‡Р°СЃРЅРёРєС–РІ</div>
              </div>
            </div>

            <p className="mt-6 text-slate-300 leading-relaxed">
              {club.description}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              {club.leader && (
                <div className="flex items-center gap-3">
                  <User size={20} className="text-slate-400" />
                  <div>
                    <p className="text-slate-400">РљРµСЂС–РІРЅРёРє</p>
                    <p className="font-medium">{club.leader}</p>
                  </div>
                </div>
              )}

              {club.meetingTime && (
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-slate-400" />
                  <div>
                    <p className="text-slate-400">Р§Р°СЃ Р·СѓСЃС‚СЂС–С‡РµР№</p>
                    <p className="font-medium">{club.meetingTime}</p>
                  </div>
                </div>
              )}

              {club.schedule && (
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-slate-400" />
                  <div>
                    <p className="text-slate-400">Р РѕР·РєР»Р°Рґ</p>
                    <p className="font-medium">{club.schedule}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users size={20} className="text-slate-400" />
                <div>
                  <p className="text-slate-400">РЈС‡Р°СЃРЅРёРєС–РІ</p>
                  <p className="font-medium">
                    {club.currentMembers} Р· {club.maxMembers || 'РЅРµРѕР±РјРµР¶РµРЅРѕ'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-slate-400 mb-2">РљРѕРЅС‚Р°РєС‚</p>
              <p className="text-lg">{club.contact}</p>
            </div>

            <div className="mt-10">
              {isAuthenticated ? (
                <button
                  onClick={isMember ? handleLeave : handleJoin}
                  disabled={joining}
                  className={`w-full py-4 rounded-2xl font-semibold text-base transition ${
                    isMember 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                  }`}
                >
                  {joining 
                    ? "РћР±СЂРѕР±РєР°..." 
                    : isMember 
                      ? "Р’РёР№С‚Рё Р· РіСѓСЂС‚РєР°" 
                      : "РџСЂРёС”РґРЅР°С‚РёСЃСЏ РґРѕ РіСѓСЂС‚РєР°"}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-2xl"
                >
                  РЈРІС–Р№С‚Рё, С‰РѕР± РїСЂРёС”РґРЅР°С‚РёСЃСЏ
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
````

## frontend\src\pages\clubs\ClubsList.tsx

``tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  Users, 
  Search, 
  ArrowRight 
} from 'lucide-react';

interface Club {
  id: number;
  title: string;
  description: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader?: string;
}

const ClubsList = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clubs');
      const items = res.data.items || res.data;

      // Р¤С–РєСЃРёРјРѕ currentMembers
      const fixedItems = items.map((club: any) => ({
        ...club,
        currentMembers: club.members?.length ?? club.currentMembers ?? 0
      }));

      setClubs(fixedItems);
      setTotal(res.data.total || items.length || 0);
    } catch (err) {
      console.error('Failed to load clubs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.title.toLowerCase().includes(search.toLowerCase()) ||
    club.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Users size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">РЎС‚СѓРґРµРЅС‚СЃСЊРєС– РіСѓСЂС‚РєРё</h1>
              <p className="text-slate-400 mt-1">РџСЂРёС”РґРЅСѓР№СЃСЏ РґРѕ СЃРїС–Р»СЊРЅРѕС‚ С‚Р° СЂРѕР·РІРёРІР°Р№СЃСЏ СЂР°Р·РѕРј</p>
            </div>
          </div>
          <p className="text-slate-500">Р—РЅР°Р№РґРµРЅРѕ: <span className="text-white font-medium">{total}</span> РіСѓСЂС‚РєС–РІ</p>
        </div>

        
        <div className="relative mb-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="РџРѕС€СѓРє РіСѓСЂС‚РєР°..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-cyan-500 text-lg"
          />
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map((club) => (
              <Link
                to={`/clubs/${club.id}`}
                key={club.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col h-full"
              >
                
                <div className="relative h-52 bg-slate-800 overflow-hidden">
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.title}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <Users size={60} className="text-slate-700" />
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Users size={14} />
                    {club.currentMembers}/{club.maxMembers || 'в€ћ'}
                  </div>
                </div>

                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-cyan-400 transition">
                    {club.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-4 mb-6 flex-1">
                    {club.description}
                  </p>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-800 text-cyan-400 font-medium">
                    Р”РµС‚Р°Р»СЊРЅС–С€Рµ
                    <ArrowRight className="group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Users size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Р“СѓСЂС‚РєС–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ</p>
            <p className="text-slate-500 mt-2">РЎРїСЂРѕР±СѓР№С‚Рµ С–РЅС€РёР№ РїРѕС€СѓРєРѕРІРёР№ Р·Р°РїРёС‚</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsList;
````

## frontend\src\pages\clubs\MyClubsPage.tsx

``tsx
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { api } from '../../services/api';

import {
  Users,
  MessageCircle,
} from 'lucide-react';

const MyClubsPage = () => {
  const [clubs, setClubs] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get(
        '/clubs/participated',
      );

      setClubs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          РњРѕС— РіСѓСЂС‚РєРё
        </h1>

        {clubs.length === 0 ? (
          <div className="text-slate-400">
            Р’Рё С‰Рµ РЅРµ Р±РµСЂРµС‚Рµ СѓС‡Р°СЃС‚С– РІ РіСѓСЂС‚РєР°С…
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
              >
                {club.image && (
                  <img
                    src={club.image}
                    alt={club.title}
                    className="w-full h-44 object-cover rounded-2xl mb-5"
                  />
                )}

                <h2 className="text-xl font-semibold">
                  {club.title}
                </h2>

                <p className="text-slate-400 mt-3 line-clamp-3">
                  {club.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-500 mt-5">
                  <Users size={16} />

                  {club.members?.length || 0}{' '}
                  СѓС‡Р°СЃРЅРёРєС–РІ
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/clubs/${club.id}`}
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      bg-slate-800
                      hover:bg-slate-700
                      flex items-center justify-center
                    "
                  >
                    Р”РµС‚Р°Р»С–
                  </Link>

                  <Link
                    to={`/chat/clubs/${club.id}`}
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      bg-cyan-500
                      hover:bg-cyan-400
                      text-black
                      flex items-center justify-center gap-2
                      font-medium
                    "
                  >
                    <MessageCircle
                      size={18}
                    />

                    Р§Р°С‚
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClubsPage;
````

## frontend\src\pages\documents\DocumentsList.tsx

``tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Download, FileText, Search, X } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  description: string;
  file: string | null;
  originalFileName?: string;
  mimeType?: string;
  size?: number;
  type: string;
  category: {
    id: number;
    name: string;
  };
  createdAt: string;
  author?: {
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

const DocumentsList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.items || res.data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const openFile = (doc: Document) => {
    if (!doc.file) return;
    setSelectedTitle(doc.title);
    setSelectedFile(doc.file);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.description.toLowerCase().includes(search.toLowerCase()) ||
    doc.category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <FileText size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">Р”РѕРєСѓРјРµРЅС‚Рё</h1>
              <p className="text-slate-400 mt-1">РћС„С–С†С–Р№РЅС– РґРѕРєСѓРјРµРЅС‚Рё, С€Р°Р±Р»РѕРЅРё С‚Р° Р±Р»Р°РЅРєРё</p>
            </div>
          </div>
          <p className="text-slate-500">
            Р—РЅР°Р№РґРµРЅРѕ: <span className="text-white font-medium">{documents.length}</span> РґРѕРєСѓРјРµРЅС‚С–РІ
          </p>
        </div>

        
        <div className="relative mb-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="РџРѕС€СѓРє РґРѕРєСѓРјРµРЅС‚С–РІ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-cyan-500 text-lg"
          />
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => openFile(doc)}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full"
              >
                <div className="h-52 bg-slate-800 flex items-center justify-center relative">
                  <FileText size={80} className="text-slate-600 group-hover:text-cyan-500/30 transition" />
                  <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs font-medium">
                    {doc.category.name}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-cyan-400 transition">
                    {doc.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-800">
                    <div className="text-cyan-400 flex items-center gap-2">
                      <Download size={16} />
                      РџРµСЂРµРіР»СЏРЅСѓС‚Рё
                    </div>
                    {doc.originalFileName && (
                      <span className="text-xs text-slate-500 truncate max-w-[140px]">
                        {doc.originalFileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <FileText size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Р”РѕРєСѓРјРµРЅС‚С–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ</p>
            <p className="text-slate-500 mt-2">РЎРїСЂРѕР±СѓР№С‚Рµ Р·РјС–РЅРёС‚Рё РїРѕС€СѓРєРѕРІРёР№ Р·Р°РїРёС‚</p>
          </div>
        )}
      </div>

      
      {selectedFile && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col">
          
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-cyan-400" />
              <h3 className="font-medium text-lg truncate max-w-[700px]">{selectedTitle}</h3>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={selectedFile}
                download
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition text-sm font-medium"
              >
                <Download size={18} />
                Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё
              </a>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedTitle('');
                }}
                className="p-2 hover:bg-slate-800 rounded-xl transition"
              >
                <X size={26} />
              </button>
            </div>
          </div>

          
          <div className="flex-1 bg-slate-950 p-4">
            <iframe
              src={selectedFile}
              className="w-full h-full rounded-2xl border border-slate-700 bg-white"
              title={selectedTitle}
            />
          </div>

          <div className="p-3 text-center text-xs text-slate-500 bg-slate-900 border-t border-slate-700">
            РЇРєС‰Рѕ РґРѕРєСѓРјРµРЅС‚ РЅРµ РІС–РґРѕР±СЂР°Р¶Р°С”С‚СЊСЃСЏ, СЃРїСЂРѕР±СѓР№С‚Рµ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё С„Р°Р№Р»
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
````

## frontend\src\pages\faq\FaqPage.tsx

``tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, ChevronDown, HelpCircle, X } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
}

const FaqPage = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openId, setOpenId] = useState<number | null>(null);

  // РњРѕРґР°Р»СЊРЅРµ РІС–РєРЅРѕ
  const [showModal, setShowModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [modalCategory, setModalCategory] = useState('OTHER');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'ALL', label: 'Р’СЃС– РїРёС‚Р°РЅРЅСЏ' },
    { value: 'ADMISSION', label: 'Р’СЃС‚СѓРї' },
    { value: 'DOCUMENTS', label: 'Р”РѕРєСѓРјРµРЅС‚Рё' },
    { value: 'STUDIES', label: 'РќР°РІС‡Р°РЅРЅСЏ' },
    { value: 'SCHEDULE', label: 'Р РѕР·РєР»Р°Рґ' },
    { value: 'CLUBS', label: 'Р“СѓСЂС‚РєРё' },
    { value: 'TEACHERS', label: 'Р’РёРєР»Р°РґР°С‡С–' },
    { value: 'OTHER', label: 'Р†РЅС€Рµ' },
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faq');
      setFaqs(res.data.items || res.data);
    } catch (err) {
      console.error('Failed to load FAQ', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs
    .filter(faq => faq.isPublished) // рџ‘€ Р”РћР”РђР™ Р¦Р•
    .filter(faq => {
      const matchesSearch =
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.question.localeCompare(b.question));

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/faq/ask', {
        question: questionText.trim(),
        category: modalCategory
      });
      alert('Р’Р°С€Рµ РїРёС‚Р°РЅРЅСЏ РЅР°РґС–СЃР»Р°РЅРѕ! Р”СЏРєСѓС”РјРѕ.');
      setQuestionText('');
      setShowModal(false);
    } catch (err) {
      alert('РџРѕРјРёР»РєР° РїСЂРё РІС–РґРїСЂР°РІС†С– РїРёС‚Р°РЅРЅСЏ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle size={48} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Р§Р°СЃС‚С– Р·Р°РїРёС‚Р°РЅРЅСЏ</h1>
          <p className="text-slate-400 text-lg">РўСѓС‚ Р·С–Р±СЂР°РЅС– РІС–РґРїРѕРІС–РґС– РЅР° РЅР°Р№РїРѕС€РёСЂРµРЅС–С€С– РїРёС‚Р°РЅРЅСЏ СЃС‚СѓРґРµРЅС‚С–РІ</p>
        </div>

        
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="РџРѕС€СѓРє РїРёС‚Р°РЅСЊ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 py-4 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-800/50"
                >
                  <span className="font-medium pr-6 text-left">{faq.question}</span>
                  <ChevronDown className={`text-cyan-400 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} size={22} />
                </button>
                {openId === faq.id && (
                  <div className="px-6 pb-6 pt-2 text-slate-300 leading-relaxed border-t border-slate-800">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <HelpCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-xl text-slate-400">РќС–С‡РѕРіРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ</p>
          </div>
        )}

        
        <div className="mt-16 text-center">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-8 py-4 rounded-2xl text-lg transition"
          >
            <HelpCircle size={24} />
            Р—Р°РґР°С‚Рё СЃРІРѕС” РїРёС‚Р°РЅРЅСЏ
          </button>
        </div>
      </div>

      
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Р—Р°РґР°С‚Рё РїРёС‚Р°РЅРЅСЏ</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="p-6">
              <div className="mb-6">
                <label className="block text-slate-400 mb-2">РљР°С‚РµРіРѕСЂС–СЏ</label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-slate-400 mb-2">Р’Р°С€Рµ РїРёС‚Р°РЅРЅСЏ</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="РќР°РїРёС€С–С‚СЊ РІР°С€Рµ РїРёС‚Р°РЅРЅСЏ СЏРєРѕРјРѕРіР° РґРµС‚Р°Р»СЊРЅС–С€Рµ..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 min-h-[140px] focus:border-cyan-500 resize-y"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !questionText.trim()}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold py-4 rounded-2xl transition"
              >
                {submitting ? 'Р’С–РґРїСЂР°РІРєР°...' : 'РќР°РґС–СЃР»Р°С‚Рё РїРёС‚Р°РЅРЅСЏ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqPage;
````

## frontend\src\pages\Home.tsx

``tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

import { 
  Newspaper, 
  Users, 
  BookOpen, 
  User, 
  HelpCircle, 
  FileText,
  ArrowRight,
  Trophy,
  Calendar
} from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  category: string;
  pinned: boolean;
  createdAt: string;
}

interface Club {
  id: number;
  title: string;
  description: string;
  image?: string;
  maxMembers: number;
  currentMembers?: number;
  members?: any[];
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  ANNOUNCEMENT: 'РћРіРѕР»РѕС€РµРЅРЅСЏ',
  EVENT: 'РџРѕРґС–СЏ',
  EDUCATION: 'РќР°РІС‡Р°РЅРЅСЏ',
  ADMINISTRATION: 'РђРґРјС–РЅС–СЃС‚СЂР°С†С–СЏ',
};

const categoryColors: Record<string, string> = {
  ANNOUNCEMENT: '#f59e0b',
  EVENT: '#06b6d4',
  EDUCATION: '#10b981',
  ADMINISTRATION: '#8b5cf6',
};

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [totalNews, setTotalNews] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [newsRes, clubsRes, faqRes, teachersRes] = await Promise.all([
          api.get('/news', { params: { limit: 3 } }),
          api.get('/clubs', { params: { limit: 6 } }),
          api.get('/faq', { params: { limit: 4 } }),
          api.get('/teachers', { params: { limit: 1 } }),
        ]);

        setNews(newsRes.data.items || []);
        setTotalNews(newsRes.data.total || newsRes.data.items?.length || 0);
        
        setClubs(clubsRes.data.items || []);
        
        setFaqs(faqRes.data.items || []);
        
        setTotalTeachers(teachersRes.data.total || 42); // fallback СЏРєС‰Рѕ total РЅРµ РїСЂРёС…РѕРґРёС‚СЊ
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.12) 0%, transparent 70%)',
          }}
        />

        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            РЈРЅС–РІРµСЂСЃРёС‚РµС‚СЃСЊРєРёР№ РїРѕСЂС‚Р°Р» СЃС‚СѓРґРµРЅС‚С–РІ
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
            РЈСЃРµ РЅРµРѕР±С…С–РґРЅРµ<br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              РІ РѕРґРЅРѕРјСѓ РјС–СЃС†С–
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            РќРѕРІРёРЅРё, РЅР°РІС‡Р°Р»СЊРЅС– РјР°С‚РµСЂС–Р°Р»Рё, РІРёРєР»Р°РґР°С‡С–, РіСѓСЂС‚РєРё С‚Р° FAQ вЂ” Р°РєС‚СѓР°Р»СЊРЅР° С–РЅС„РѕСЂРјР°С†С–СЏ РґР»СЏ РєРѕР¶РЅРѕРіРѕ СЃС‚СѓРґРµРЅС‚Р°.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/news"
              className="rounded-2xl bg-cyan-500 px-8 py-3.5 font-semibold text-black transition hover:bg-cyan-400 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              Р§РёС‚Р°С‚Рё РЅРѕРІРёРЅРё <ArrowRight size={18} />
            </Link>
            {isAuthenticated ? (
              <Link
                to="/clubs"
                className="rounded-2xl border border-slate-700 px-8 py-3.5 font-semibold transition hover:bg-slate-800 hover:-translate-y-0.5"
              >
                РњРѕС— РіСѓСЂС‚РєРё
              </Link>
            ) : (
              <Link
                to="/register"
                className="rounded-2xl border border-slate-700 px-8 py-3.5 font-semibold transition hover:bg-slate-800 hover:-translate-y-0.5"
              >
                Р—Р°СЂРµС”СЃС‚СЂСѓРІР°С‚РёСЃСЊ
              </Link>
            )}
          </div>

          
          <div className="mt-16 flex flex-wrap justify-center gap-3 text-sm text-slate-400">
            {[
              { icon: <Newspaper size={20} />, label: 'РќРѕРІРёРЅ', value: totalNews },
              { icon: <User size={20} />, label: 'Р’РёРєР»Р°РґР°С‡С–РІ', value: totalTeachers },
              { icon: <Users size={20} />, label: 'Р“СѓСЂС‚РєС–РІ', value: clubs.length },
              { icon: <Trophy size={20} />, label: 'РђРєС‚РёРІРЅРёС… СЃС‚СѓРґРµРЅС‚С–РІ', value: '1200+' },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-3"
              >
                <div className="text-cyan-400">{s.icon}</div>
                <div>
                  <span className="text-xl font-bold text-white block">{s.value}</span>
                  <span className="text-xs">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
          <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M0 96L60 85.3C120 75 240 53 360 48C480 43 600 53 720 58.7C840 64 960 64 1080 56C1200 48 1320 32 1380 24L1440 16V96H0Z"
              fill="#0f172a"
            />
          </svg>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">РђРєС‚СѓР°Р»СЊРЅРѕ</p>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Newspaper size={28} className="text-cyan-400" />
              РћСЃС‚Р°РЅРЅС– РЅРѕРІРёРЅРё
            </h2>
          </div>
          <Link
            to="/news"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
          >
            Р’СЃС– РЅРѕРІРёРЅРё <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((item, idx) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className={`group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition hover:border-slate-600 hover:-translate-y-1 ${
                  idx === 0 ? 'md:col-span-2' : ''
                }`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full object-cover transition group-hover:scale-105 ${
                      idx === 0 ? 'h-72' : 'h-44'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-full ${idx === 0 ? 'h-72' : 'h-44'} flex items-center justify-center bg-gradient-to-br from-cyan-900/30 to-slate-800`}
                  >
                    <Newspaper size={48} className="opacity-30" />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    {item.pinned && (
                      <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                        рџ“Њ Р—Р°РєСЂС–РїР»РµРЅРѕ
                      </span>
                    )}
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: `${categoryColors[item.category] || '#06b6d4'}22`,
                        color: categoryColors[item.category] || '#06b6d4',
                      }}
                    >
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-cyan-400 transition">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {item.content}
                  </p>

                  <p className="mt-4 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-16 text-slate-500">РќРѕРІРёРЅ РїРѕРєРё РЅРµРјР°С”</p>
        )}
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-4 pb-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">Р РѕР·РґС–Р»Рё</p>
          <h2 className="text-3xl font-bold">Р©Рѕ С” РЅР° РїРѕСЂС‚Р°Р»С–</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BookOpen, title: 'РќР°РІС‡Р°Р»СЊРЅС– РјР°С‚РµСЂС–Р°Р»Рё', desc: 'Р›РµРєС†С–С—, РїСЂРµР·РµРЅС‚Р°С†С–С—, РјРµС‚РѕРґРёС‡РєРё РІС–Рґ РІРёРєР»Р°РґР°С‡С–РІ', to: '/materials', accent: '#06b6d4' },
            { icon: User, title: 'Р’РёРєР»Р°РґР°С‡С–', desc: 'РљРѕРЅС‚Р°РєС‚Рё, РєР°Р±С–РЅРµС‚Рё С‚Р° С–РЅС„РѕСЂРјР°С†С–СЏ РїСЂРѕ РєР°С„РµРґСЂРё', to: '/teachers', accent: '#8b5cf6' },
            { icon: Users, title: 'Р“СѓСЂС‚РєРё', desc: 'РЎС‚СѓРґРµРЅС‚СЃСЊРєС– РєР»СѓР±Рё, Р·Р°РїРёСЃ С‚Р° СЃРїС–Р»РєСѓРІР°РЅРЅСЏ', to: '/clubs', accent: '#10b981' },
            { icon: HelpCircle, title: 'FAQ', desc: 'Р’С–РґРїРѕРІС–РґС– РЅР° РЅР°Р№РїРѕС€РёСЂРµРЅС–С€С– РїРёС‚Р°РЅРЅСЏ СЃС‚СѓРґРµРЅС‚С–РІ', to: '/faq', accent: '#f59e0b' },
            { icon: Newspaper, title: 'РќРѕРІРёРЅРё', desc: 'РћРіРѕР»РѕС€РµРЅРЅСЏ, РїРѕРґС–С— С‚Р° РЅРѕРІРёРЅРё СѓРЅС–РІРµСЂСЃРёС‚РµС‚Сѓ', to: '/news', accent: '#ef4444' },
            { icon: FileText, title: 'Р”РѕРєСѓРјРµРЅС‚Рё', desc: 'РЁР°Р±Р»РѕРЅРё, Р·СЂР°Р·РєРё, Р±Р»Р°РЅРєРё С‚Р° РґРѕРІС–РґРєРё', to: '/documents', accent: '#3b82f6' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-600 hover:-translate-y-0.5"
              >
                <div className="mb-4">
                  <Icon size={32} className="text-cyan-400" />
                </div>
                <h3 className="mb-1 font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
                <div 
                  className="mt-6 flex items-center gap-2 text-xs font-medium transition group-hover:gap-3"
                  style={{ color: item.accent }}
                >
                  РџРµСЂРµР№С‚Рё <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      
      {clubs.length > 0 && (
        <section className="border-y border-slate-800/60 bg-slate-900/40 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">РЎРїС–Р»СЊРЅРѕС‚Р°</p>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Users size={28} className="text-cyan-400" />
                  РЎС‚СѓРґРµРЅС‚СЃСЊРєС– РіСѓСЂС‚РєРё
                </h2>
              </div>
              <Link
                to="/clubs"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
              >
                Р’СЃС– РіСѓСЂС‚РєРё <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.slice(0, 6).map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/40 hover:-translate-y-0.5"
                >
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.title}
                      className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                      рџЋЇ
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold group-hover:text-cyan-400 transition">
                      {club.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{club.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {club.currentMembers ?? club.members?.length ?? 0} / {club.maxMembers || 'в€ћ'} СѓС‡Р°СЃРЅРёРєС–РІ
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      
      {faqs.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">РџРёС‚Р°РЅРЅСЏ</p>
            <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
              <HelpCircle size={28} className="text-cyan-400" />
              Р§Р°СЃС‚С– Р·Р°РїРёС‚Р°РЅРЅСЏ
            </h2>
            <p className="mt-2 text-slate-400">РќР°Р№РїРѕРїСѓР»СЏСЂРЅС–С€С– РїРёС‚Р°РЅРЅСЏ РІС–Рґ СЃС‚СѓРґРµРЅС‚С–РІ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden transition hover:border-slate-700"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <span
                    className="text-cyan-400 text-xl flex-shrink-0 transition-transform"
                    style={{ transform: openFaq === faq.id ? 'rotate(180deg)' : 'none' }}
                  >
                    в†“
                  </span>
                </button>
                {openFaq === faq.id && (
                  <div className="border-t border-slate-800 px-5 pb-5 pt-4 text-slate-300 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-6 py-3 text-sm transition hover:bg-slate-800"
            >
              Р’СЃС– Р·Р°РїРёС‚Р°РЅРЅСЏ <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      
      {!isAuthenticated && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div
            className="relative overflow-hidden rounded-3xl border border-cyan-500/20 p-12 text-center"
            style={{
              background: 'radial-gradient(ellipse 80% 120% at 50% 120%, rgba(6,182,212,0.12) 0%, transparent 60%)',
            }}
          >
            <h2 className="text-3xl font-bold mb-3">РџСЂРёС”РґРЅСѓР№СЃСЏ РґРѕ StudentHub</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Р РµС”СЃС‚СЂСѓР№СЃСЏ, С‰РѕР± Р·Р°РїРёСЃСѓРІР°С‚РёСЃСЊ Сѓ РіСѓСЂС‚РєРё, СЃС‚РµР¶РёС‚Рё Р·Р° РЅРѕРІРёРЅР°РјРё С‚Р° СЃРїС–Р»РєСѓРІР°С‚РёСЃСЊ С–Р· СЃРїС–Р»СЊРЅРѕС‚РѕСЋ.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="rounded-2xl bg-cyan-500 px-8 py-3.5 font-semibold text-black transition hover:bg-cyan-400"
              >
                РЎС‚РІРѕСЂРёС‚Рё Р°РєР°СѓРЅС‚
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-slate-700 px-8 py-3.5 font-semibold transition hover:bg-slate-800"
              >
                РЈРІС–Р№С‚Рё
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
````

## frontend\src\pages\materials\MaterialsList.tsx

``tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BookOpen, 
  Search, 
  Download, 
  Calendar, 
  User, 
  X 
} from 'lucide-react';

interface Material {
  id: number;
  title: string;
  description: string;
  type: string;
  file?: string;
  originalFileName?: string;
  category: { name: string };
  createdAt: string;
  author?: {
    profile?: { firstName?: string; lastName?: string };
  };
}

const MaterialsList = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Р”Р»СЏ РїРµСЂРµРіР»СЏРґСѓ РґРѕРєСѓРјРµРЅС‚Р°
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/materials');
      setMaterials(res.data.items || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDocument = (fileUrl: string, title: string) => {
    if (fileUrl.endsWith('.pdf')) {
      setSelectedFile(fileUrl);
      setSelectedTitle(title);
    } else {
      // Р”Р»СЏ С–РЅС€РёС… С„Р°Р№Р»С–РІ вЂ” РїСЂРѕСЃС‚Рѕ Р·Р°РІР°РЅС‚Р°Р¶СѓС”РјРѕ
      window.open(fileUrl, '_blank');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title.toLowerCase().includes(search.toLowerCase()) ||
      material.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || material.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-4 mb-4">
          <BookOpen size={40} className="text-cyan-400" />
          <div>
            <h1 className="text-4xl font-bold">РќР°РІС‡Р°Р»СЊРЅС– РјР°С‚РµСЂС–Р°Р»Рё</h1>
            <p className="text-slate-400">Р›РµРєС†С–С—, РїСЂРµР·РµРЅС‚Р°С†С–С— С‚Р° РјРµС‚РѕРґРёС‡РЅС– РїРѕСЃС–Р±РЅРёРєРё</p>
          </div>
        </div>

        
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="РџРѕС€СѓРє РјР°С‚РµСЂС–Р°Р»С–РІ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 py-4 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Р’СЃС– С‚РёРїРё</option>
            <option value="lecture">Р›РµРєС†С–С—</option>
            <option value="presentation">РџСЂРµР·РµРЅС‚Р°С†С–С—</option>
            <option value="methodical">РњРµС‚РѕРґРёС‡РЅС– РјР°С‚РµСЂС–Р°Р»Рё</option>
            <option value="other">Р†РЅС€Рµ</option>
          </select>
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-900 rounded-3xl animate-pulse" />)}
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col cursor-pointer"
                onClick={() => material.file && openDocument(material.file, material.title)}
              >
                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400">
                    {material.category.name}
                  </div>
                  <BookOpen size={52} className="text-slate-600 group-hover:scale-110 transition" />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-cyan-400 transition mb-3">
                    {material.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-3 flex-1">
                    {material.description}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500">
                    <div>{new Date(material.createdAt).toLocaleDateString('uk-UA')}</div>
                    {material.author?.profile && (
                      <div>{material.author.profile.firstName} {material.author.profile.lastName}</div>
                    )}
                  </div>

                  {material.file && (
                    <button className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition">
                      <Download size={18} />
                      РџРµСЂРµРіР»СЏРЅСѓС‚Рё / Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">РњР°С‚РµСЂС–Р°Р»С–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ</p>
          </div>
        )}
      </div>

      
      {selectedFile && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col">
          
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4 z-10">
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-lg">{selectedTitle}</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href={selectedFile}
                download
                className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2 text-sm"
              >
                Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё
              </a>
              
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedTitle('');
                }}
                className="p-2 hover:bg-slate-800 rounded-xl transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          
          <div className="flex-1 bg-slate-950 relative">
            <iframe
              src={selectedFile}
              className="w-full h-full"
              title={selectedTitle}
            />
          </div>

          
          <div className="p-3 text-center text-xs text-slate-500 bg-slate-900 border-t border-slate-700">
            РЇРєС‰Рѕ РґРѕРєСѓРјРµРЅС‚ РЅРµ Р·Р°РІР°РЅС‚Р°Р¶СѓС”С‚СЊСЃСЏ, СЃРїСЂРѕР±СѓР№С‚Рµ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё С„Р°Р№Р»
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
````

## frontend\src\pages\news\NewsDetail.tsx

``tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Send, 
  Trash2 
} from 'lucide-react';

interface News {
  id: number;
  title: string;
  content: string;
  image?: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  author?: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();

  const [news, setNews] = useState<News | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchNewsAndComments();
  }, [id]);

  const fetchNewsAndComments = async () => {
    setLoading(true);
    try {
      const [newsRes, commentsRes] = await Promise.all([
        api.get(`/news/${id}`),
        api.get(`/news/${id}/comments`)
      ]);
      
      setNews(newsRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setCommentLoading(true);
    try {
      await api.post(`/news/${id}/comments`, { content: newComment.trim() });
      setNewComment('');
      fetchNewsAndComments(); // РѕРЅРѕРІР»СЋС”РјРѕ СЃРїРёСЃРѕРє РєРѕРјРµРЅС‚Р°СЂС–РІ
    } catch (err: any) {
      alert(err.response?.data?.message || 'РќРµ РІРґР°Р»РѕСЃСЏ РґРѕРґР°С‚Рё РєРѕРјРµРЅС‚Р°СЂ');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Р’РёРґР°Р»РёС‚Рё С†РµР№ РєРѕРјРµРЅС‚Р°СЂ?')) return;

    try {
      await api.delete(`/news/${id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё РєРѕРјРµРЅС‚Р°СЂ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-xl text-slate-400">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl">РќРѕРІРёРЅСѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ</h2>
          <Link to="/news" className="text-cyan-400 hover:underline mt-4 inline-block">
            в†ђ РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РЅРѕРІРёРЅ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 text-lg transition"
        >
          <ArrowLeft size={20} />
          РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РЅРѕРІРёРЅ
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {news.image && (
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-[420px] object-cover"
            />
          )}

          <div className="p-8 md:p-12">
            {news.pinned && (
              <span className="inline-flex items-center gap-2 bg-amber-500 text-black px-5 py-2 rounded-2xl text-sm font-semibold mb-6">
                рџ“Њ Р—Р°РєСЂС–РїР»РµРЅР° РЅРѕРІРёРЅР°
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {news.title}
            </h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 mb-10">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                {new Date(news.createdAt).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="capitalize">вЂў {news.category}</div>
              {news.author?.profile && (
                <div className="flex items-center gap-2">
                  <User size={18} />
                  {news.author.profile.firstName} {news.author.profile.lastName}
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none text-lg leading-relaxed text-slate-200">
              {news.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-6">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            РљРѕРјРµРЅС‚Р°СЂС– ({comments.length})
          </h2>

          
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-10">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="РќР°РїРёС€С–С‚СЊ СЃРІС–Р№ РєРѕРјРµРЅС‚Р°СЂ..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 min-h-[120px] focus:outline-none focus:border-cyan-500 resize-y"
                  required
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold px-8 py-3 rounded-2xl flex items-center gap-2 transition"
                >
                  {commentLoading ? 'Р’С–РґРїСЂР°РІРєР°...' : 'РћРїСѓР±Р»С–РєСѓРІР°С‚Рё'}
                  <Send size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center mb-10">
              <p className="text-slate-400">РЈРІС–Р№РґС–С‚СЊ, С‰РѕР± Р·Р°Р»РёС€Р°С‚Рё РєРѕРјРµРЅС‚Р°СЂС–</p>
              <Link
                to="/login"
                className="inline-block mt-4 bg-cyan-500 text-black px-6 py-3 rounded-2xl font-semibold hover:bg-cyan-400"
              >
                РЈРІС–Р№С‚Рё
              </Link>
            </div>
          )}

          
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {comment.author.profile?.firstName} {comment.author.profile?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </div>

                    {(user?.id === comment.author.id || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-400 hover:text-red-500 transition p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <p className="mt-4 text-slate-200 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                РљРѕРјРµРЅС‚Р°СЂС–РІ РїРѕРєРё РЅРµРјР°С”. Р‘СѓРґСЊС‚Рµ РїРµСЂС€РёРј!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
````

## frontend\src\pages\news\NewsList.tsx

``tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  Newspaper, 
  ArrowRight, 
  Calendar,
  Tag
} from 'lucide-react';

interface News {
  id: number;
  title: string;
  content: string;
  image?: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  author?: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

const categories = [
  { value: '', label: 'Р’СЃС– РЅРѕРІРёРЅРё' },
  { value: 'ANNOUNCEMENT', label: 'РћРіРѕР»РѕС€РµРЅРЅСЏ' },
  { value: 'EVENT', label: 'РџРѕРґС–С—' },
  { value: 'EDUCATION', label: 'РќР°РІС‡Р°РЅРЅСЏ' },
  { value: 'ADMINISTRATION', label: 'РђРґРјС–РЅС–СЃС‚СЂР°С†С–СЏ' },
];

const categoryColors: Record<string, string> = {
  ANNOUNCEMENT: '#f59e0b',
  EVENT: '#06b6d4',
  EDUCATION: '#10b981',
  ADMINISTRATION: '#8b5cf6',
};

const NewsList = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchNews();
  }, [search, category, page]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news', {
        params: {
          search,
          category: category || undefined,
          page,
          limit: 9,
        },
      });

      setNews(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load news', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Newspaper size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">РќРѕРІРёРЅРё С‚Р° РѕРіРѕР»РѕС€РµРЅРЅСЏ</h1>
              <p className="text-slate-400 mt-1">РђРєС‚СѓР°Р»СЊРЅР° С–РЅС„РѕСЂРјР°С†С–СЏ СѓРЅС–РІРµСЂСЃРёС‚РµС‚Сѓ</p>
            </div>
          </div>
          <p className="text-slate-500">Р—РЅР°Р№РґРµРЅРѕ: <span className="text-white font-medium">{totalItems}</span> РїСѓР±Р»С–РєР°С†С–Р№</p>
        </div>

        
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1">
            <input
              type="text"
              placeholder="РџРѕС€СѓРє РЅРѕРІРёРЅ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500 min-w-[200px]"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Link
                to={`/news/${item.id}`}
                key={item.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col h-full"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Newspaper size={48} className="text-slate-700" />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full">
                        рџ“Њ Р—Р°РєСЂС–РїР»РµРЅРѕ
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${categoryColors[item.category] || '#64748b'}22`,
                        color: categoryColors[item.category] || '#64748b',
                      }}
                    >
                      <Tag size={14} />
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-cyan-400 transition">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 line-clamp-3 text-sm mb-6 flex-1">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                    {item.author?.profile && (
                      <span>
                        {item.author.profile.firstName} {item.author.profile.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Newspaper size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Р—Р° РІР°С€РёРј Р·Р°РїРёС‚РѕРј РЅС–С‡РѕРіРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ</p>
            <p className="text-slate-500 mt-2">РЎРїСЂРѕР±СѓР№С‚Рµ Р·РјС–РЅРёС‚Рё РїР°СЂР°РјРµС‚СЂРё РїРѕС€СѓРєСѓ</p>
          </div>
        )}

        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-16">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition font-medium ${
                  p === page
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;
````

## frontend\src\pages\profile\ProfilePage.tsx

``tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Save, User, Edit2, X } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'TEACHER';

  const [profile, setProfile] = useState<any>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [teacherFormData, setTeacherFormData] = useState({
    department: '',
    subject: '',
    cabinet: '',
    consultationHours: '',
    bio: '',
    phone: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Р—Р°РіР°Р»СЊРЅРёР№ РїСЂРѕС„С–Р»СЊ
      const profileRes = await api.get('/profile/me');
      setProfile(profileRes.data);

      setFormData({
        firstName: profileRes.data.profile?.firstName || '',
        lastName: profileRes.data.profile?.lastName || '',
        phone: profileRes.data.profile?.phone || '',
      });

      // РЇРєС‰Рѕ РІРёРєР»Р°РґР°С‡ вЂ” Р·Р°РІР°РЅС‚Р°Р¶СѓС”РјРѕ РґРѕРґР°С‚РєРѕРІС– РґР°РЅС–
      if (isTeacher) {
        const teacherRes = await api.get('/teachers/me');
        setTeacherProfile(teacherRes.data);

        setTeacherFormData({
          department: teacherRes.data.department || '',
          subject: teacherRes.data.subject || '',
          cabinet: teacherRes.data.cabinet || '',
          consultationHours: teacherRes.data.consultationHours || '',
          bio: teacherRes.data.bio || '',
          phone: teacherRes.data.phone || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/profile/me', formData);
      alert('Р—Р°РіР°Р»СЊРЅСѓ С–РЅС„РѕСЂРјР°С†С–СЋ РѕРЅРѕРІР»РµРЅРѕ!');
      fetchAllData();
    } catch (err) {
      alert('РџРѕРјРёР»РєР° РѕРЅРѕРІР»РµРЅРЅСЏ');
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(
        Object.entries(teacherFormData).filter(([_, v]) => v !== '')
      );
      await api.patch('/teachers/me', payload);
      alert('Р’РёРєР»Р°РґР°С†СЊРєС– РґР°РЅС– РѕРЅРѕРІР»РµРЅРѕ!');
      fetchAllData();
    } catch (err) {
      alert('РџРѕРјРёР»РєР° РѕРЅРѕРІР»РµРЅРЅСЏ РІРёРєР»Р°РґР°С†СЊРєРёС… РґР°РЅРёС…');
    }
  };

  if (loading) return <div className="p-8 text-center">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">РњС–Р№ РїСЂРѕС„С–Р»СЊ</h1>
            <p className="text-slate-400 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            {editing ? <X size={20} /> : <Edit2 size={20} />}
            {editing ? 'РЎРєР°СЃСѓРІР°С‚Рё' : 'Р РµРґР°РіСѓРІР°С‚Рё'}
          </button>
        </div>

        
        <div className="flex flex-col items-center mb-10">
          <img
            src={profile?.profile?.avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-700"
          />
          <button className="mt-3 text-cyan-400 text-sm hover:underline">
            Р—РјС–РЅРёС‚Рё Р°РІР°С‚Р°СЂРєСѓ
          </button>
        </div>

        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User size={22} /> Р—Р°РіР°Р»СЊРЅР° С–РЅС„РѕСЂРјР°С†С–СЏ
          </h2>

          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm">Р†Рј'СЏ</p>
                <p className="text-lg">{profile?.profile?.firstName || 'вЂ”'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">РџСЂС–Р·РІРёС‰Рµ</p>
                <p className="text-lg">{profile?.profile?.lastName || 'вЂ”'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">РўРµР»РµС„РѕРЅ</p>
                <p className="text-lg">{profile?.profile?.phone || 'вЂ”'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Р РѕР»СЊ</p>
                <p className="text-lg capitalize">{user?.role}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateGeneral} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Р†Рј'СЏ</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">РџСЂС–Р·РІРёС‰Рµ</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">РўРµР»РµС„РѕРЅ</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
              <button type="submit" className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold">
                Р—Р±РµСЂРµРіС‚Рё Р·Р°РіР°Р»СЊРЅСѓ С–РЅС„РѕСЂРјР°С†С–СЋ
              </button>
            </form>
          )}
        </div>

        
        {isTeacher && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Р’РёРєР»Р°РґР°С†СЊРєС– РґР°РЅС–</h2>

            {!editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-400">РљР°С„РµРґСЂР°</p>
                  <p className="font-medium">{teacherProfile?.department || 'вЂ”'}</p>
                </div>
                <div>
                  <p className="text-slate-400">РџСЂРµРґРјРµС‚</p>
                  <p className="font-medium">{teacherProfile?.subject || 'вЂ”'}</p>
                </div>
                <div>
                  <p className="text-slate-400">РљР°Р±С–РЅРµС‚</p>
                  <p className="font-medium">{teacherProfile?.cabinet || 'вЂ”'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Р“РѕРґРёРЅРё РєРѕРЅСЃСѓР»СЊС‚Р°С†С–Р№</p>
                  <p className="font-medium">{teacherProfile?.consultationHours || 'вЂ”'}</p>
                </div>
                {teacherProfile?.bio && (
                  <div className="md:col-span-2">
                    <p className="text-slate-400">Р‘С–РѕРіСЂР°С„С–СЏ</p>
                    <p className="text-slate-300 whitespace-pre-line">{teacherProfile.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateTeacher} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">РљР°С„РµРґСЂР°</label>
                    <input
                      type="text"
                      value={teacherFormData.department}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, department: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">РџСЂРµРґРјРµС‚</label>
                    <input
                      type="text"
                      value={teacherFormData.subject}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, subject: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">РљР°Р±С–РЅРµС‚</label>
                    <input
                      type="text"
                      value={teacherFormData.cabinet}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, cabinet: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Р“РѕРґРёРЅРё РєРѕРЅСЃСѓР»СЊС‚Р°С†С–Р№</label>
                    <input
                      type="text"
                      value={teacherFormData.consultationHours}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, consultationHours: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                      placeholder="РќР°РїСЂРёРєР»Р°Рґ: РџРЅ, РЎСЂ 14:00-16:00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Р‘С–РѕРіСЂР°С„С–СЏ</label>
                  <textarea
                    value={teacherFormData.bio}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, bio: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 min-h-[120px]"
                    placeholder="РљРѕСЂРѕС‚РєР° С–РЅС„РѕСЂРјР°С†С–СЏ РїСЂРѕ РІР°СЃ СЏРє РІРёРєР»Р°РґР°С‡Р°..."
                  />
                </div>

                <button type="submit" className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold">
                  Р—Р±РµСЂРµРіС‚Рё РІРёРєР»Р°РґР°С†СЊРєС– РґР°РЅС–
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
````

## frontend\src\pages\teachers\TeacherDashboard.tsx

``tsx
import { useState, useEffect } from 'react';
import { BookOpen, Newspaper, Users, Award, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    materials: 0,
    clubs: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // РњРѕР¶РЅР° Р·СЂРѕР±РёС‚Рё РїР°СЂР°Р»РµР»СЊРЅС– Р·Р°РїРёС‚Рё
      const [materialsRes, clubsRes] = await Promise.all([
        api.get('/materials?my=true'),
        api.get('/clubs/my'),
      ]);

      setStats({
        materials: materialsRes.data.items?.length || materialsRes.data.length || 0,
        clubs: clubsRes.data.length || 0,
        students: 89, // РїРѕРєРё СЃС‚Р°С‚РёС‡РЅРѕ
      });
    } catch (err) {
      console.error('РџРѕРјРёР»РєР° Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ СЃС‚Р°С‚РёСЃС‚РёРєРё', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Р’С–С‚Р°С”РјРѕ Сѓ РїР°РЅРµР»С– РІРёРєР»Р°РґР°С‡Р°</h1>
        <p className="text-slate-400 text-lg">РљРµСЂСѓР№С‚Рµ СЃРІРѕС—РјРё РјР°С‚РµСЂС–Р°Р»Р°РјРё, РѕРіРѕР»РѕС€РµРЅРЅСЏРјРё С‚Р° РіСѓСЂС‚РєР°РјРё</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="text-cyan-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.materials}</p>
              <p className="text-slate-400">РњРѕС—С… РјР°С‚РµСЂС–Р°Р»С–РІ</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <Users className="text-purple-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.clubs}</p>
              <p className="text-slate-400">Р“СѓСЂС‚РєС–РІ</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Award className="text-emerald-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.students}</p>
              <p className="text-slate-400">РЎС‚СѓРґРµРЅС‚С–РІ</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">РЁРІРёРґРєС– РґС–С—</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          
          <Link 
            to="/teacher/materials" 
            className="block p-6 bg-slate-900 border border-slate-700 rounded-3xl hover:border-cyan-500 transition group"
          >
            <BookOpen size={32} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-lg">РњРѕС— РјР°С‚РµСЂС–Р°Р»Рё</h3>
            <p className="text-slate-400 text-sm mt-1">Р—Р°РІР°РЅС‚Р°Р¶СѓР№С‚Рµ С‚Р° СЂРµРґР°РіСѓР№С‚Рµ Р»РµРєС†С–С—, РїСЂРµР·РµРЅС‚Р°С†С–С—</p>
          </Link>

          
          <Link 
            to="/teacher/clubs" 
            className="block p-6 bg-slate-900 border border-slate-700 rounded-3xl hover:border-cyan-500 transition"
          >
            <Users size={32} className="text-cyan-400 mb-4" />
            <h3 className="font-semibold text-lg">РњРѕС— РіСѓСЂС‚РєРё</h3>
            <p className="text-slate-400 text-sm mt-1">РљРµСЂСѓР№С‚Рµ СЃРІРѕС—РјРё СЃС‚СѓРґРµРЅС‚СЃСЊРєРёРјРё РѕР±вЂ™С”РґРЅР°РЅРЅСЏРјРё</p>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
````

## frontend\src\pages\teachers\TeacherDetail.tsx

``tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  User 
} from 'lucide-react';

const TeacherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teachers/${id}`);
      setTeacher(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-xl text-slate-400">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ С–РЅС„РѕСЂРјР°С†С–С—...</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl">Р’РёРєР»Р°РґР°С‡Р° РЅРµ Р·РЅР°Р№РґРµРЅРѕ</h2>
          <Link to="/teachers" className="text-cyan-400 hover:underline mt-4 inline-block">
            в†ђ РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ СЃРїРёСЃРєСѓ РІРёРєР»Р°РґР°С‡С–РІ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/teachers"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 text-lg transition"
        >
          <ArrowLeft size={20} />
          РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РІРёРєР»Р°РґР°С‡С–РІ
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-5 gap-0">
            
            <div className="md:col-span-2 bg-slate-800 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-[320px]">
                {teacher.photo ? (
                  <img
                    src={teacher.photo}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl border border-slate-700"
                  />
                ) : (
                  <div className="w-full aspect-square bg-slate-700 rounded-2xl flex items-center justify-center">
                    <User size={120} className="text-slate-500" />
                  </div>
                )}
              </div>
            </div>

            
            <div className="md:col-span-3 p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {teacher.firstName} {teacher.lastName}
              </h1>

              <p className="text-2xl text-cyan-400 mt-2">{teacher.department}</p>
              <p className="text-xl text-slate-300 mt-1">{teacher.subject}</p>

              <div className="mt-8 space-y-6">
                {teacher.cabinet && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <MapPin size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">РљР°Р±С–РЅРµС‚</p>
                      <p className="text-lg font-medium">{teacher.cabinet}</p>
                    </div>
                  </div>
                )}

                {teacher.email && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Mail size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <a 
                        href={`mailto:${teacher.email}`} 
                        className="text-lg hover:text-cyan-400 transition"
                      >
                        {teacher.email}
                      </a>
                    </div>
                  </div>
                )}

                {teacher.phone && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Phone size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">РўРµР»РµС„РѕРЅ</p>
                      <a 
                        href={`tel:${teacher.phone}`} 
                        className="text-lg hover:text-cyan-400 transition"
                      >
                        {teacher.phone}
                      </a>
                    </div>
                  </div>
                )}

                {teacher.consultationHours && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Calendar size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Р“РѕРґРёРЅРё РєРѕРЅСЃСѓР»СЊС‚Р°С†С–Р№</p>
                      <p className="text-lg">{teacher.consultationHours}</p>
                    </div>
                  </div>
                )}
              </div>

              {teacher.bio && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    РџСЂРѕ РІРёРєР»Р°РґР°С‡Р°
                  </h3>
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                    {teacher.bio.split('\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
````

## frontend\src\pages\teachers\TeacherMaterials.tsx

``tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, FileText, Edit2, Trash2 } from 'lucide-react';
import AddMaterialModal from '../../components/materials/AddMaterialModal';
import EditMaterialModal from '../../components/materials/EditMaterialModal';

const TeacherMaterials = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  // Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РјР°С‚РµСЂС–Р°Р»С–РІ РІРёРєР»Р°РґР°С‡Р°
  useEffect(() => {
    fetchMyMaterials();
  }, []);

  const fetchMyMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials?my=true');
      setMaterials(res.data.items || res.data);
    } catch (err) {
      console.error('РџРѕРјРёР»РєР° Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РјР°С‚РµСЂС–Р°Р»С–РІ:', err);
    } finally {
      setLoading(false);
    }
  };

  // Р’С–РґРєСЂРёС‚С‚СЏ РјРѕРґР°Р»РєРё СЂРµРґР°РіСѓРІР°РЅРЅСЏ
  const handleEdit = (material: any) => {
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };

  // Р’РёРґР°Р»РµРЅРЅСЏ РјР°С‚РµСЂС–Р°Р»Сѓ
  const handleDelete = async (id: number) => {
    if (!window.confirm('Р’Рё РІРїРµРІРЅРµРЅС–, С‰Рѕ С…РѕС‡РµС‚Рµ РІРёРґР°Р»РёС‚Рё С†РµР№ РјР°С‚РµСЂС–Р°Р»?')) {
      return;
    }

    try {
      await api.delete(`/materials/${id}`);
      alert('РњР°С‚РµСЂС–Р°Р» СѓСЃРїС–С€РЅРѕ РІРёРґР°Р»РµРЅРѕ');
      fetchMyMaterials(); // РѕРЅРѕРІР»СЋС”РјРѕ СЃРїРёСЃРѕРє
    } catch (err: any) {
      alert(err.response?.data?.message || 'РџРѕРјРёР»РєР° РїСЂРё РІРёРґР°Р»РµРЅРЅС–');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">РњРѕС— РјР°С‚РµСЂС–Р°Р»Рё</h1>
            <p className="text-slate-400">РњР°С‚РµСЂС–Р°Р»Рё, СЏРєС– РІРё Р·Р°РІР°РЅС‚Р°Р¶РёР»Рё</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 text-black px-5 py-3 rounded-2xl font-semibold hover:bg-cyan-400 transition"
          >
            <Plus size={20} />
            Р”РѕРґР°С‚Рё РјР°С‚РµСЂС–Р°Р»
          </button>
        </div>

        
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-slate-400">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РјР°С‚РµСЂС–Р°Р»С–РІ...</p>
          </div>
        ) : materials.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <FileText size={60} className="mx-auto text-slate-600 mb-4" />
            <p className="text-xl text-slate-400">РЈ РІР°СЃ С‰Рµ РЅРµРјР°С” РјР°С‚РµСЂС–Р°Р»С–РІ</p>
            <p className="text-slate-500 mt-2">РќР°С‚РёСЃРЅС–С‚СЊ "Р”РѕРґР°С‚Рё РјР°С‚РµСЂС–Р°Р»", С‰РѕР± РїРѕС‡Р°С‚Рё</p>
          </div>
        ) : (
          /* Materials Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="bg-slate-900 border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg leading-tight">{mat.title}</h3>
                  <span className="text-xs px-2.5 py-1 bg-slate-800 text-cyan-400 rounded-full">
                    {mat.type === 'lecture' && 'Р›РµРєС†С–СЏ'}
                    {mat.type === 'presentation' && 'РџСЂРµР·РµРЅС‚Р°С†С–СЏ'}
                    {mat.type === 'methodical' && 'РњРµС‚РѕРґРёС‡РєР°'}
                    {mat.type === 'other' && 'Р†РЅС€Рµ'}
                  </span>
                </div>

                <p className="text-slate-400 text-sm line-clamp-3 mb-6">
                  {mat.description}
                </p>

                {mat.category && (
                  <p className="text-xs text-slate-500 mb-4">
                    РљР°С‚РµРіРѕСЂС–СЏ: {mat.category.name}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(mat)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Edit2 size={16} />
                    Р РµРґР°РіСѓРІР°С‚Рё
                  </button>

                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="flex-1 bg-red-900/50 hover:bg-red-900 py-2.5 rounded-2xl text-sm text-red-400 flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={16} />
                    Р’РёРґР°Р»РёС‚Рё
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMyMaterials}
      />

      <EditMaterialModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMaterial(null);
        }}
        material={selectedMaterial}
        onSuccess={fetchMyMaterials}
      />
    </div>
  );
};

export default TeacherMaterials;
````

## frontend\src\pages\teachers\TeacherMyClubs.tsx

``tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Users, Edit2, Trash2, MessageCircle } from 'lucide-react';
import CreateClubModal from '../../components/clubs/CreateClubModal';
import EditClubModal from '../../components/clubs/EditClubModal';
import { useNavigate } from 'react-router-dom';

const TeacherMyClubs = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const navigate = useNavigate();
  // Р—Р°РІР°РЅС‚Р°Р¶СѓС”РјРѕ СЃС‚РІРѕСЂРµРЅС– РІРёРєР»Р°РґР°С‡РµРј РіСѓСЂС‚РєРё
  const fetchMyCreatedClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clubs/my-created');   // Р’Р°Р¶Р»РёРІРѕ: my-created
      console.log('РћС‚СЂРёРјР°РЅС– РіСѓСЂС‚РєРё:', res.data);        // в†ђ Р”Р»СЏ РґРµР±Р°РіСѓ
      setClubs(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (err) {
      console.error('РџРѕРјРёР»РєР° Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РјРѕС—С… РіСѓСЂС‚РєС–РІ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCreatedClubs();
  }, []);

  const handleCreateSuccess = () => {
    fetchMyCreatedClubs();   // РџСЂРёРјСѓСЃРѕРІРѕ РѕРЅРѕРІР»СЋС”РјРѕ СЃРїРёСЃРѕРє
  };

  const handleEdit = (club: any) => {
    setSelectedClub(club);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Р РѕР·С„РѕСЂРјСѓРІР°С‚Рё С†РµР№ РіСѓСЂС‚РѕРє?')) return;
    try {
      await api.delete(`/clubs/${id}`);
      fetchMyCreatedClubs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'РџРѕРјРёР»РєР° РІРёРґР°Р»РµРЅРЅСЏ');
    }
  };

  const openChat = (clubId: number) => {
    navigate(`/club-chat/${clubId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">РњРѕС— РіСѓСЂС‚РєРё</h1>
            <p className="text-slate-400">Р“СѓСЂС‚РєРё, СЏРєС– РІРё СЃС‚РІРѕСЂРёР»Рё СЏРє РІРёРєР»Р°РґР°С‡</p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 text-black px-5 py-3 rounded-2xl font-semibold hover:bg-cyan-400 transition"
          >
            <Plus size={20} />
            РЎС‚РІРѕСЂРёС‚Рё РіСѓСЂС‚РѕРє
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ РіСѓСЂС‚РєС–РІ...</div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20">
            <Users size={60} className="mx-auto text-slate-600 mb-4" />
            <p className="text-xl text-slate-400">Р’Рё С‰Рµ РЅРµ СЃС‚РІРѕСЂРёР»Рё Р¶РѕРґРЅРѕРіРѕ РіСѓСЂС‚РєР°</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <div key={club.id} className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                {club.image && (
                  <img 
                    src={club.image} 
                    alt={club.title} 
                    className="w-full h-40 object-cover rounded-2xl mb-4" 
                  />
                )}

                <h3 className="font-semibold text-xl mb-2">{club.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3 mb-4">{club.description}</p>

                <div className="flex justify-between text-sm text-slate-400 mb-6">
                  <span>РЈС‡Р°СЃРЅРёРєС–РІ: {club.currentMembers || 0} / {club.maxMembers || 'в€ћ'}</span>
                  {club.leader && <span>РљРµСЂС–РІРЅРёРє: {club.leader}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openChat(club.id)}
                    className="py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle size={18} /> Р§Р°С‚
                  </button>

                  <button
                    onClick={() => handleEdit(club)}
                    className="py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 size={18} /> Р РµРґР°РіСѓРІР°С‚Рё
                  </button>

                  <button
                    onClick={() => handleDelete(club.id)}
                    className="col-span-2 py-3 bg-red-900/50 hover:bg-red-900 rounded-2xl text-red-400 flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={18} /> Р РѕР·С„РѕСЂРјСѓРІР°С‚Рё РіСѓСЂС‚РѕРє
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess} 
      />

      <EditClubModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClub(null);
        }}
        club={selectedClub}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default TeacherMyClubs;
````

## frontend\src\pages\teachers\TeachersList.tsx

``tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  Users, 
  Search, 
  MapPin, 
  Mail, 
  Phone,
  ArrowRight 
} from 'lucide-react';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  subject: string;
  cabinet?: string;
  phone?: string;
  email?: string;
  photo?: string;
  createdAt: string;
}

const TeachersList = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers');
      setTeachers(res.data.items || res.data);
      setTotal(res.data.total || res.data.length || 0);
    } catch (err) {
      console.error('Failed to load teachers', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.firstName} ${teacher.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    teacher.department.toLowerCase().includes(search.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Users size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">Р’РёРєР»Р°РґР°С‡С–</h1>
              <p className="text-slate-400 mt-1">РљРѕРЅС‚Р°РєС‚Рё С‚Р° С–РЅС„РѕСЂРјР°С†С–СЏ РїСЂРѕ РІРёРєР»Р°РґР°С†СЊРєРёР№ СЃРєР»Р°Рґ</p>
            </div>
          </div>
          <p className="text-slate-500">Р—РЅР°Р№РґРµРЅРѕ: <span className="text-white font-medium">{total}</span> РІРёРєР»Р°РґР°С‡С–РІ</p>
        </div>

        
        <div className="relative mb-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="РџРѕС€СѓРє РІРёРєР»Р°РґР°С‡Р°, РєР°С„РµРґСЂРё С‡Рё РїСЂРµРґРјРµС‚Сѓ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-cyan-500 text-lg"
          />
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Link
                to={`/teachers/${teacher.id}`}
                key={teacher.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col"
              >
                
                <div className="h-64 bg-slate-800 flex items-center justify-center overflow-hidden relative">
                  {teacher.photo ? (
                    <img
                      src={teacher.photo}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-7xl text-slate-700">
                      рџ‘ЁвЂЌрџЏ«
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {teacher.department}
                  </div>
                </div>

                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-semibold mb-1 group-hover:text-cyan-400 transition">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  
                  <p className="text-cyan-400 font-medium mb-4">{teacher.subject}</p>

                  <div className="space-y-3 text-sm text-slate-400 flex-1">
                    {teacher.cabinet && (
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-slate-500" />
                        <span>РљР°Р±С–РЅРµС‚: <span className="text-white">{teacher.cabinet}</span></span>
                      </div>
                    )}

                    {teacher.email && (
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-slate-500" />
                        <a 
                          href={`mailto:${teacher.email}`} 
                          className="hover:text-cyan-400 transition"
                        >
                          {teacher.email}
                        </a>
                      </div>
                    )}

                    {teacher.phone && (
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-slate-500" />
                        <a 
                          href={`tel:${teacher.phone}`} 
                          className="hover:text-cyan-400 transition"
                        >
                          {teacher.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Р”РµС‚Р°Р»СЊРЅС–С€Рµ</span>
                    <ArrowRight className="text-cyan-400 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Users size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Р’РёРєР»Р°РґР°С‡С–РІ Р·Р° РІР°С€РёРј Р·Р°РїРёС‚РѕРј РЅРµ Р·РЅР°Р№РґРµРЅРѕ</p>
            <p className="text-slate-500 mt-2">РЎРїСЂРѕР±СѓР№С‚Рµ Р·РјС–РЅРёС‚Рё РїР°СЂР°РјРµС‚СЂРё РїРѕС€СѓРєСѓ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersList;
````

## frontend\src\router\index.tsx

``tsx
import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import AdminLayout from '../components/layout/AdminLayout';

import PrivateRoute from './PrivateRoute';

/* Pages */
import Home from '../pages/Home';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import ProfilePage from '../pages/profile/ProfilePage';

/* News */
import NewsList from '../pages/news/NewsList';
import NewsDetail from '../pages/news/NewsDetail';

/* Clubs */
import ClubsList from '../pages/clubs/ClubsList';
import ClubDetail from '../pages/clubs/ClubDetail';
import MyClubsPage from '../pages/clubs/MyClubsPage';
import ClubChatPage from '../pages/clubs/ClubChatPage';

/* Teachers */
import TeachersList from '../pages/teachers/TeachersList';
import TeacherDetail from '../pages/teachers/TeacherDetail';
import TeacherMaterials from '../pages/teachers/TeacherMaterials';
import TeacherDashboard from '../pages/teachers/TeacherDashboard';
import TeacherMyClubs from '../pages/teachers/TeacherMyClubs';

/* Admin */

/* Materials */
import MaterialsList from '../pages/materials/MaterialsList';

/* FAQ */
import FaqPage from '../pages/faq/FaqPage';

/* Documents */
import DocumentsList from '../pages/documents/DocumentsList';

/* Admin pages */
import AdminUsers from '../pages/admin/AdminUsers';
import AdminNews from '../pages/admin/AdminNews';
import AdminFaq from '../pages/admin/AdminFaq';
import AdminDocuments from '../pages/admin/AdminDocuments';
import AdminDashboard from '../pages/admin/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',

    element: <MainLayout />,

    children: [
      {
        index: true,
        element: <Home />,
      },

      /* NEWS */
      {
        path: 'news',
        element: <NewsList />,
      },

      {
        path: 'news/:id',
        element: <NewsDetail />,
      },

      /* TEACHERS */
      {
        path: 'teachers',
        element: <TeachersList />,
      },

      {
        path: 'teachers/:id',
        element: <TeacherDetail />,
      },

      /* CLUBS */
      {
        path: 'clubs',
        element: <ClubsList />,
      },

      {
        path: 'clubs/:id',
        element: <ClubDetail />,
      },

      {
        path: 'my-clubs',

        element: <PrivateRoute />,

        children: [
          {
            index: true,
            element: <MyClubsPage />,
          },
        ],
      },

      {
        path: 'chat/clubs/:id',

        element: <PrivateRoute />,

        children: [
          {
            index: true,
            element: <ClubChatPage />,
          },
        ],
      },

      /* FAQ */
      {
        path: 'faq',
        element: <FaqPage />,
      },

      /* MATERIALS */
      {
        path: 'materials',
        element: <MaterialsList />,
      },

      /* DOCUMENTS */
      {
        path: 'documents',
        element: <DocumentsList />,
      },

      /* PROFILE */
      {
        path: 'profile',

        element: <PrivateRoute />,

        children: [
          {
            index: true,
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  /* =========================
      TEACHER PANEL
  ========================= */

  {
    path: 'teacher',

    element: (
      <PrivateRoute
        allowedRoles={[
          'TEACHER',
          'ADMIN',
        ]}
      />
    ),

    children: [
      {
        element: <TeacherLayout />,

        children: [
          {
            index: true,
            element: <TeacherDashboard />,
          },

          {
            path: 'materials',
            element: <TeacherMaterials />,
          },

          {
            path: 'clubs',
            element: <TeacherMyClubs />,
          },

          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  /* =========================
      ADMIN PANEL
  ========================= */

  {
    path: 'admin',

    element: (
      <PrivateRoute
        allowedRoles={['ADMIN']}
      />
    ),

    children: [
      {
        element: <AdminLayout />,

        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },

          {
            path: 'users',
            element: <AdminUsers />,
          },
          
          {
            path: 'news',
            element: <AdminNews />,
          },

          {
            path: 'faq',
            element: <AdminFaq />,
          },

          {
            path: 'documents',
            element: <AdminDocuments />,
          },

          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  /* AUTH */

  {
    path: '/login',
    element: <Login />,
  },

  {
    path: '/register',
    element: <Register />,
  },

  /* 404 */

  {
    path: '*',

    element: (
      <div className="p-10 text-center text-2xl">
        404 вЂ” РЎС‚РѕСЂС–РЅРєСѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ
      </div>
    ),
  },
]);

export default router;
````

## frontend\src\router\PrivateRoute.tsx

``tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // РЇРєС‰Рѕ РІРєР°Р·Р°РЅС– РґРѕР·РІРѕР»РµРЅС– СЂРѕР»С– вЂ” РїРµСЂРµРІС–СЂСЏС”РјРѕ
  if (allowedRoles && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
````

## frontend\src\services\api.ts

``ts
import axios from 'axios';

const API_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
````

## frontend\src\services\authService.ts

``ts
import api from './api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'STUDENT' | 'TEACHER';
}

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },
};
````

## frontend\src\services\chat.socket.ts

``ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectChat = (
  token: string,
) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(
    'http://localhost:3000',
    {
      transports: [
        'websocket',
      ],

      auth: {
        token,
      },
    },
  );

  socket.on(
    'connect',
    () => {
      console.log(
        'Socket connected',
      );
    },
  );

  socket.on(
    'disconnect',
    () => {
      console.log(
        'Socket disconnected',
      );
    },
  );

  socket.on(
    'connect_error',
    (err) => {
      console.error(
        'Socket error:',
        err.message,
      );
    },
  );

  return socket;
};

export const disconnectChat =
  () => {
    if (socket) {
      socket.disconnect();

      socket = null;
    }
  };

export const getChatSocket =
  () => socket;
````

## frontend\src\services\documents.api.ts

``ts
import api from './api';

export const DocumentsAPI = {
  getAll: (params?: any) =>
    api.get('/documents', { params }),

  getById: (id: number) =>
    api.get(`/documents/${id}`),

  create: (data: FormData) =>
    api.post('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: any) =>
    api.patch(`/documents/${id}`, data),

  remove: (id: number) =>
    api.delete(`/documents/${id}`),

  getCategories: () =>
    api.get('/documents/categories'),

  createCategory: (data: any) =>
    api.post('/documents/categories', data),

  deleteCategory: (id: number) =>
    api.delete(`/documents/categories/${id}`),
};
````

## frontend\src\services\faqApi.service.ts

``ts
import api from './api';

export const faqApi = {
  getAll: (params?: any) => api.get('/faq', { params }),

  create: (data: any) => {
    console.log('рџ“¤ CREATE PAYLOAD:', data);
    return api.post('/faq', data);
  },

  update: (id: number, data: any) => {    
    return api.patch(`/faq/${id}`, data);
  },

  remove: (id: number) => api.delete(`/faq/${id}`),
};
````

## frontend\src\store\authStore.ts

``ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';

interface User {
  id: number;
  sub?: number;
  email: string;
  role: string;
  profile?: any;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (token: string) => {
        localStorage.setItem('access_token', token);
        try {
          const userData = await authService.getCurrentUser();
          set({ user: userData, isAuthenticated: true });
        } catch (err) {
          console.error("Failed to load user");
          get().logout();
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
          const userData = await authService.getCurrentUser();
          set({ user: userData, isAuthenticated: true });
        } catch (err) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
````

## frontend\src\types\chat.ts

``ts
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
````

