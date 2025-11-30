import { Member } from '../../../types';
import Avatar from './Avatar';

interface GroupCardProps {
  name: string;
  members: Member[];
  expenseCount?: number; // Optional, not displayed in current design
  onClick: () => void;
}

/**
 * Group card component for the groups list.
 * Full-width dark card with group name and member avatars.
 */
const GroupCard: React.FC<GroupCardProps> = ({
  name,
  members,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-stone-900/80 px-5 py-6 text-left hover:bg-stone-800/80 transition-colors border-t border-stone-800/50"
    >
      <h3 className="text-display text-2xl text-prowess-beige italic mb-3">{name}</h3>
      <div className="flex items-center gap-2">
        {members.slice(0, 4).map((member) => (
          <Avatar key={member.id} name={member.name} size="sm" />
        ))}
        {members.length > 4 && (
          <span className="text-xs text-prowess-grey ml-1">+{members.length - 4}</span>
        )}
      </div>
    </button>
  );
};

export default GroupCard;

