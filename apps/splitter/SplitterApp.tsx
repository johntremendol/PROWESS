import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Group, Expense, Member } from '../../types';
import { calculateBalances, calculateDebts } from './utils';

// Components
import Header from './components/Header';
import GroupCard from './components/GroupCard';
import CreateFlow from './components/CreateFlow';
import GroupDetail from './components/GroupDetail';

interface SplitterAppProps {
  onBack: () => void;
}

type ViewState = 'GROUPS' | 'CREATE' | 'DETAILS';

const SplitterApp: React.FC<SplitterAppProps> = ({ onBack }) => {
  const [view, setView] = useState<ViewState>('GROUPS');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Fetch Groups on Mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          members (*),
          expenses (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedGroups: Group[] = data.map((g: any) => ({
          id: g.id,
          name: g.name,
          currency: g.currency || '$',
          members: g.members,
          expenses: g.expenses.map((e: any) => ({
            ...e,
            paidBy: e.paid_by
          })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }));
        setGroups(mappedGroups);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeGroup = useMemo(() => groups.find(g => g.id === activeGroupId), [groups, activeGroupId]);
  const balances = useMemo(() => activeGroup ? calculateBalances(activeGroup) : [], [activeGroup]);
  const debts = useMemo(() => calculateDebts(balances), [balances]);

  // --- Actions ---

  const handleCreateGroup = async (name: string, members: { id: string; name: string }[]) => {
    try {
      // 1. Create Group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({ name, currency: '$' })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Create Members
      const membersPayload = members.map(m => ({
        group_id: groupData.id,
        name: m.name
      }));

      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .insert(membersPayload)
        .select();

      if (membersError) throw membersError;

      // Update local state
      const newGroup: Group = {
        id: groupData.id,
        name: groupData.name,
        currency: groupData.currency,
        members: membersData as Member[],
        expenses: []
      };

      setGroups([newGroup, ...groups]);
      setActiveGroupId(newGroup.id);
      setView('DETAILS');
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Failed to create group. Please ensure you've run the SQL schema in Supabase.");
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!activeGroup) return;

    try {
      const payload = {
        group_id: activeGroup.id,
        description: expense.description,
        amount: expense.amount,
        paid_by: expense.paidBy,
        date: expense.date,
        category: expense.category
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        ...data,
        paidBy: data.paid_by
      };

      const updatedGroup = {
        ...activeGroup,
        expenses: [newExpense, ...activeGroup.expenses]
      };

      setGroups(groups.map(g => g.id === activeGroup.id ? updatedGroup : g));
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Error adding expense. Check console for details.");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      // Delete expenses first (foreign key constraint)
      await supabase.from('expenses').delete().eq('group_id', groupId);
      
      // Delete members
      await supabase.from('members').delete().eq('group_id', groupId);
      
      // Delete the group
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      
      if (error) throw error;

      // Update local state
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("Error deleting group. Check console for details.");
    }
  };

  // --- Views ---

  // CREATE VIEW
  if (view === 'CREATE') {
    return (
      <CreateFlow
        onCreateGroup={handleCreateGroup}
        onCancel={() => setView('GROUPS')}
      />
    );
  }

  // DETAILS VIEW
  if (view === 'DETAILS' && activeGroup) {
    return (
      <GroupDetail
        group={activeGroup}
        debts={debts}
        currency={activeGroup.currency}
        onBack={() => setView('GROUPS')}
        onAddExpense={handleAddExpense}
      />
    );
  }

  // GROUPS VIEW (Default)
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <Header onBack={onBack} />

      {/* Content - Full Width, No Padding */}
      <div className="flex-1 flex flex-col">
        {/* Create Group Button - Full Width Red */}
        <button 
          onClick={() => setView('CREATE')}
          className="w-full bg-prowess-red px-5 py-6 text-left hover:brightness-110 transition-all"
        >
          <h2 className="text-display text-2xl text-prowess-beige italic mb-3">create group</h2>
          <div className="w-9 h-9 rounded-full border border-prowess-beige/50 flex items-center justify-center text-prowess-beige text-lg">
            +
          </div>
                </button>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-label text-prowess-grey text-sm animate-pulse">Syncing...</div>
          </div>
        )}

        {/* Groups List - Full Width */}
        {!loading && groups.map(group => (
          <GroupCard
            key={group.id}
            name={group.name}
            members={group.members}
            expenseCount={group.expenses.length}
            onClick={() => {
              setActiveGroupId(group.id);
              setView('DETAILS');
            }}
            onDelete={() => handleDeleteGroup(group.id)}
          />
        ))}

        {/* Empty State */}
        {!loading && groups.length === 0 && (
          <div className="text-center py-16 text-prowess-grey">
            <p className="text-label text-xs">No Groups Yet</p>
            <p className="text-label text-sm mt-2" style={{ textTransform: 'none' }}>Tap "create group" to get started</p>
          </div>
        )}
        </div>
    </div>
  );
};

export default SplitterApp;
