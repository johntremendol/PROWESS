import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Group, Expense, Member } from '../../types';
import { calculateBalances, calculateDebts } from './utils';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import AccountView from './components/auth/AccountView';

// Components
import Header from './components/Header';
import GroupCard from './components/GroupCard';
import CreateFlow from './components/CreateFlow';
import GroupDetail from './components/GroupDetail';

interface SplitterAppProps {
  onBack: () => void;
}

type ViewState = 'GROUPS' | 'CREATE' | 'DETAILS';

const SplitterInner: React.FC<SplitterAppProps> = ({ onBack }) => {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<ViewState>('GROUPS');
  const [showAccount, setShowAccount] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Fetch Groups on Mount or when User changes
  useEffect(() => {
    if (user) {
      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [user]);

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
            paidBy: e.paid_by,
            splitBetween: e.split_between
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

  const handleCreateGroup = async (name: string, members: { id: string; name: string }[], currency: string = '$') => {
    try {
      if (!user) throw new Error("Must be logged in");

      // 1. Create Group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({ name, currency })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Create Members
      // The first member is the creator (John or user's name). We link it to auth user.
      const membersPayload = members.map((m, index) => {
        // Simple heuristic: First member is creator
        // In real app, we might ask "Which one is you?" or assume index 0 if it matches known user name
        // For now, let's assume the first member added is the creator.
        const isCreator = index === 0;

        return {
          group_id: groupData.id,
          name: m.name,
          user_id: isCreator ? user.id : null,
          email: isCreator ? user.email : null
        };
      });

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
        split_between: expense.splitBetween,
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
        paidBy: data.paid_by,
        splitBetween: data.split_between
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

  // Auto-claim logic: When logging in, check if there are any members with my email but no user_id (or different user_id?)
  // Actually, the migration script handles the bulk case.
  // Here we just ensure that if I am added to a group by email, I claim it.
  useEffect(() => {
    const claimMembers = async () => {
      if (!user || loading) return;

      const { error } = await supabase
        .from('members')
        .update({ user_id: user.id })
        .eq('email', user.email)
        .is('user_id', null);

      if (error) console.error("Auto-claim failed:", error);
    };

    claimMembers();
  }, [user, loading]);

  const handleUpdateGroup = async (groupId: string, name: string, members: { id: string | null; name: string; email?: string }[], currency: string) => {
    try {
      // 1. Update Group Details
      const { error: groupError } = await supabase
        .from('groups')
        .update({ name, currency })
        .eq('id', groupId);

      if (groupError) throw groupError;

      // 2. Handle Members

      // A. Identify members to add (no ID) and update (has ID)
      const newMembers = members.filter(m => !m.id);
      const existingMembers = members.filter(m => m.id);

      // B. Identify members to delete
      // Get current IDs from state
      const currentMemberIds = activeGroup?.members.map(m => m.id) || [];
      const keptMemberIds = existingMembers.map(m => m.id as string);
      const membersToDelete = currentMemberIds.filter(id => !keptMemberIds.includes(id));

      // C. Update existing members
      for (const member of existingMembers) {
        if (!member.id) continue;
        await supabase
          .from('members')
          .update({ name: member.name, email: member.email })
          .eq('id', member.id);
      }

      // D. Insert new members
      if (newMembers.length > 0) {
        const { error: insertError } = await supabase
          .from('members')
          .insert(newMembers.map(m => ({
            group_id: groupId,
            name: m.name,
            email: m.email
          })));
        if (insertError) throw insertError;
      }

      // E. Delete removed members
      // Note: This may fail if they have expenses. We'll try, and log if it fails.
      if (membersToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('members')
          .delete()
          .in('id', membersToDelete);

        if (deleteError) {
          console.warn("Could not delete some members (likely due to existing expenses):", deleteError);
          // Optional: Notify user
        }
      }

      // 3. Refresh State (Fetch fresh data to be safe)
      await fetchGroups();

    } catch (err) {
      console.error("Error updating group:", err);
      alert("Error updating group. Check console.");
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    if (!activeGroup) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          description: updatedExpense.description,
          amount: updatedExpense.amount,
          paid_by: updatedExpense.paidBy,
          split_between: updatedExpense.splitBetween,
          category: updatedExpense.category,
          date: updatedExpense.date
        })
        .eq('id', updatedExpense.id);

      if (error) throw error;

      const updatedGroup = {
        ...activeGroup,
        expenses: activeGroup.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
      };

      setGroups(groups.map(g => g.id === activeGroup.id ? updatedGroup : g));
    } catch (err) {
      console.error("Error updating expense:", err);
      alert("Error updating expense. Check console for details.");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!activeGroup) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      const updatedGroup = {
        ...activeGroup,
        expenses: activeGroup.expenses.filter(e => e.id !== expenseId)
      };

      setGroups(groups.map(g => g.id === activeGroup.id ? updatedGroup : g));
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Error deleting expense. Check console for details.");
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

  const handleAddSettlement = async (settlement: { paidBy: string; paidTo: string; amount: number; date: string }) => {
    // Convert settlement to expense logic
    // A settlement is effectively a payment from A to B, which creates a debt from B to A.
    // This cancels out the existing debt from A to B.
    const expensePayload = {
      description: 'Settlement',
      amount: settlement.amount,
      paidBy: settlement.paidBy,
      splitBetween: [settlement.paidTo],
      category: 'settlement',
      date: settlement.date
    };

    await handleAddExpense(expensePayload);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-label text-sm text-prowess-grey animate-pulse">Initializing...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (showAccount) {
    return <AccountView onClose={() => setShowAccount(false)} />;
  }

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
        onUpdateExpense={handleUpdateExpense}
        onUpdateGroup={(name, members, currency) => handleUpdateGroup(activeGroup.id, name, members, currency)}
        onDeleteExpense={handleDeleteExpense}
        onAddSettlement={handleAddSettlement}
      />
    );
  }

  // GROUPS VIEW (Default)
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <Header
        onBack={onBack}
        onProfileClick={() => setShowAccount(true)}
      />

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

const SplitterApp: React.FC<SplitterAppProps> = (props) => {
  return (
    <AuthProvider>
      <SplitterInner {...props} />
    </AuthProvider>
  );
};

export default SplitterApp;
