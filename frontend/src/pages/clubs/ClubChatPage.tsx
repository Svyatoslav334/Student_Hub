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