import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from '../../../components/ui/Icons';
import Avatar from './Avatar';

type CreateStep = 'idle' | 'name' | 'members';

interface TempMember {
  id: string;
  name: string;
}

interface CreateFlowProps {
  onCreateGroup: (name: string, members: TempMember[]) => void;
  onCancel: () => void;
}

/**
 * Multi-step animated group creation flow.
 * - Step 1: Red panel expands, enter group name
 * - Step 2: Add members, create button appears when >= 2 members
 */
const CreateFlow: React.FC<CreateFlowProps> = ({ onCreateGroup, onCancel }) => {
  const [step, setStep] = useState<CreateStep>('name');
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<TempMember[]>([]);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus name input on mount
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Auto-focus member input when step changes to members
    if (step === 'members') {
      memberInputRef.current?.focus();
    }
  }, [step]);

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && groupName.trim()) {
      setStep('members');
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    setMembers([...members, { id: Date.now().toString(), name: memberName.trim() }]);
    setMemberName('');
    memberInputRef.current?.focus();
  };

  const handleMemberKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMember();
    }
    if (e.key === 'Escape') {
      if (members.length === 0) {
        setStep('name');
      } else {
        onCancel();
      }
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleCreate = () => {
    if (groupName.trim() && members.length >= 2) {
      onCreateGroup(groupName.trim(), members);
    }
  };

  const canCreate = groupName.trim() && members.length >= 2;

  return (
    <div className="create-panel min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={onCancel}
          className="text-prowess-beige/60 hover:text-prowess-beige text-sm transition-colors"
        >
          Cancel
        </button>
        <div className="text-display text-prowess-beige text-2xl italic">$</div>
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Group Name Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full border border-prowess-beige/30 flex items-center justify-center">
              <Plus size={16} className="text-prowess-beige/60" />
            </div>
            <input
              ref={nameInputRef}
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="group name"
              className="flex-1 bg-transparent border-b border-prowess-beige/20 py-2 text-2xl text-prowess-beige placeholder-prowess-beige/40 focus:border-prowess-beige focus:outline-none transition-colors text-display"
              disabled={step === 'members'}
            />
          </div>
        </div>

        {/* Members Section - Only visible in step 2 */}
        {step === 'members' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            {/* Member Input */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleAddMember}
                className="w-8 h-8 rounded-full border border-prowess-beige/30 flex items-center justify-center hover:bg-prowess-beige/10 transition-colors"
              >
                <Plus size={16} className="text-prowess-beige/60" />
              </button>
              <input
                ref={memberInputRef}
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={handleMemberKeyDown}
                placeholder="member name"
                className="flex-1 bg-transparent border-b border-prowess-beige/20 py-2 text-lg text-prowess-beige placeholder-prowess-beige/40 focus:border-prowess-beige focus:outline-none transition-colors"
              />
            </div>

            {/* Members List */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 py-2"
                >
                  <Avatar name={member.name} size="sm" variant="filled" className="bg-prowess-beige text-prowess-red" />
                  <span className="flex-1 text-prowess-beige">{member.name}</span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-prowess-beige/40 hover:text-prowess-beige transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Create Button */}
            {canCreate && (
              <div className="mt-auto pt-6">
                <button
                  onClick={handleCreate}
                  className="w-full py-4 border border-prowess-beige text-prowess-beige uppercase tracking-widest text-sm hover:bg-prowess-beige hover:text-prowess-red transition-colors"
                >
                  Create Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFlow;

