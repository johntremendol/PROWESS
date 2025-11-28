import { Member } from '../../../types';
import Avatar from './Avatar';

interface GroupCardProps {
  name: string;
  members: Member[];
  expenseCount: number;
  onClick: () => void;
}

/**
 * Group card component for the groups list.
 * Shows group name and member avatars.
 */
const GroupCard: React.FC<GroupCardProps> = ({
  name,
  members,
  expenseCount,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="card-group w-full text-left"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-display text-xl text-prowess-beige mb-2">{name}</h3>
          <div className="flex items-center gap-2">
            {members.slice(0, 4).map((member) => (
              <Avatar key={member.id} name={member.name} size="sm" />
            ))}
            {members.length > 4 && (
              <span className="text-xs text-prowess-grey">+{members.length - 4}</span>
            )}
          </div>
        </div>
        <span className="text-prowess-grey text-xs text-label">
          {expenseCount} exp
        </span>
      </div>
    </button>
  );
};

export default GroupCard;

