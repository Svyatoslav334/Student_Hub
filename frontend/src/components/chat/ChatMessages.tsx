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