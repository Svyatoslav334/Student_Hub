interface Props {
  title: string;
  members: number;
  subtitle?: string;
}

const ChatHeader = ({ title, members, subtitle }: Props) => {
  return (
    <div className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0">
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {subtitle || `${members} учасників`}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;