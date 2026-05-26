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
          placeholder="Написати повідомлення..."
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