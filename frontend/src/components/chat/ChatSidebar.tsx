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
          Чати гуртків
        </h2>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {clubs.map((club) => {
          const active =
            club.id === currentClubId;
          const memberCount = 
              typeof club.members === 'number' ? club.members :
              club.memberCount ?? 
              club.membersCount ?? 
              (Array.isArray(club.members) ? club.members.length : 0) ?? 
              0;

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
                  {memberCount} учасників
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
