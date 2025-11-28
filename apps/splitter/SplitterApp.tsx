import React, { useState, useMemo } from 'react';
import { Group, Expense, Member } from '../../types';
import { calculateBalances, calculateDebts } from './utils';
import { 
  ArrowLeft, Plus, Receipt, Trash2, Check, Users
} from '../../components/ui/Icons';

interface SplitterAppProps {
  onBack: () => void;
}

// --- Initial Data (Mock) ---
const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Weekend Trip',
    currency: '$',
    members: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' }
    ],
    expenses: [
      { id: 'e1', description: 'Gas', amount: 45.00, paidBy: '1', date: '2023-10-27', category: 'Transport' },
      { id: 'e2', description: 'Groceries', amount: 120.50, paidBy: '2', date: '2023-10-27', category: 'Food' },
    ]
  }
];

// --- Component Views ---
type ViewState = 'GROUPS' | 'CREATE' | 'DETAILS';

const SplitterApp: React.FC<SplitterAppProps> = ({ onBack }) => {
  const [view, setView] = useState<ViewState>('GROUPS');
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Create Group State
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMembers, setNewMembers] = useState<Member[]>([]);

  // Expense State
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPayer, setNewPayer] = useState('');

  const activeGroup = useMemo(() => groups.find(g => g.id === activeGroupId), [groups, activeGroupId]);

  const balances = useMemo(() => activeGroup ? calculateBalances(activeGroup) : [], [activeGroup]);
  const debts = useMemo(() => calculateDebts(balances), [balances]);

  // --- Actions ---

  const handleCreateGroup = () => {
    if (!newGroupName || newMembers.length === 0) return;
    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      currency: '$',
      members: newMembers,
      expenses: []
    };
    setGroups([newGroup, ...groups]);
    setActiveGroupId(newGroup.id);
    setView('DETAILS');
    // Reset Form
    setNewGroupName('');
    setNewMembers([]);
  };

  const handleAddMember = () => {
    if (!newMemberName) return;
    setNewMembers([...newMembers, { id: Date.now().toString(), name: newMemberName }]);
    setNewMemberName('');
  };

  const handleAddExpense = () => {
    if (!activeGroup || !newDesc || !newAmount || !newPayer) return;

    const expense: Expense = {
      id: Date.now().toString(),
      description: newDesc,
      amount: parseFloat(newAmount),
      paidBy: newPayer,
      date: new Date().toISOString().split('T')[0],
      category: 'General'
    };

    const updatedGroup = {
      ...activeGroup,
      expenses: [expense, ...activeGroup.expenses]
    };

    setGroups(groups.map(g => g.id === activeGroup.id ? updatedGroup : g));
    setNewDesc('');
    setNewAmount('');
  };

  const formatMoney = (amount: number) => {
    return `${activeGroup?.currency || '$'}${Math.abs(amount).toFixed(2)}`;
  };

  // --- Renderers ---

  if (view === 'GROUPS') {
    return (
      <div className="min-h-screen bg-black text-prowess-beige font-sans p-6 flex flex-col">
        <header className="mb-12 flex justify-between items-start">
          <div>
             <h1 className="text-4xl font-serif text-prowess-red mb-2">Groups</h1>
             <p className="text-prowess-grey text-sm tracking-widest uppercase">Select or Initialize</p>
          </div>
          <button onClick={onBack} className="text-prowess-grey hover:text-white transition-colors text-sm uppercase tracking-widest">
            Exit
          </button>
        </header>

        <div className="grid gap-4">
          <button 
            onClick={() => setView('CREATE')}
            className="border border-dashed border-prowess-grey/30 p-8 rounded-none text-left hover:bg-white/5 transition-colors group"
          >
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 border border-prowess-red flex items-center justify-center text-prowess-red group-hover:bg-prowess-red group-hover:text-black transition-colors">
                 <Plus size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-serif">Create New Group</h3>
                 <p className="text-prowess-grey text-xs uppercase tracking-wider mt-1">Start fresh settlement</p>
               </div>
             </div>
          </button>

          {groups.map(g => (
            <button 
              key={g.id}
              onClick={() => { setActiveGroupId(g.id); setView('DETAILS'); }}
              className="bg-stone-900/30 border border-white/10 p-8 text-left hover:border-prowess-red transition-colors group relative overflow-hidden"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-serif text-white mb-1">{g.name}</h3>
                  <p className="text-prowess-grey text-xs uppercase tracking-wider">
                    {g.members.length} Members • {g.expenses.length} Expenses
                  </p>
                </div>
                <div className="text-prowess-red opacity-0 group-hover:opacity-100 transition-opacity text-sm uppercase tracking-widest font-bold">
                  Open &rarr;
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'CREATE') {
    return (
      <div className="min-h-screen bg-black text-prowess-beige font-sans p-6 flex flex-col">
        <header className="mb-12">
           <button onClick={() => setView('GROUPS')} className="text-prowess-grey hover:text-white mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
             <ArrowLeft size={14} /> Back
           </button>
           <h1 className="text-3xl font-serif text-white">Initialize Group</h1>
        </header>

        <div className="space-y-12 max-w-lg">
          {/* Step 1: Name */}
          <div className="space-y-4">
            <label className="block text-prowess-grey text-xs uppercase tracking-widest">01. Group Designation</label>
            <input 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Japan 2024"
              className="w-full bg-transparent border-b border-white/20 py-4 text-2xl text-white placeholder-stone-700 focus:border-prowess-red outline-none transition-colors font-serif"
              autoFocus
            />
          </div>

          {/* Step 2: Members */}
          <div className="space-y-6">
            <label className="block text-prowess-grey text-xs uppercase tracking-widest">02. Add Members</label>
            
            <div className="flex gap-4">
              <input 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                placeholder="Member Name"
                className="flex-1 bg-transparent border-b border-white/20 py-2 text-lg text-white placeholder-stone-700 focus:border-prowess-red outline-none transition-colors"
              />
              <button 
                onClick={handleAddMember}
                disabled={!newMemberName}
                className="text-prowess-red disabled:opacity-50 hover:text-white transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {newMembers.map(m => (
                <div key={m.id} className="border border-white/20 px-4 py-2 rounded-full flex items-center gap-3 text-sm">
                  <span>{m.name}</span>
                  <button 
                    onClick={() => setNewMembers(newMembers.filter(mem => mem.id !== m.id))}
                    className="text-prowess-grey hover:text-prowess-red"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {newMembers.length === 0 && (
                <p className="text-stone-700 italic text-sm">No members added yet.</p>
              )}
            </div>
          </div>

          <button 
            onClick={handleCreateGroup}
            disabled={!newGroupName || newMembers.length === 0}
            className="w-full bg-prowess-red text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            Create Group
          </button>
        </div>
      </div>
    );
  }

  // VIEW: DETAILS
  return (
    <div className="min-h-screen bg-black text-prowess-beige font-sans flex flex-col">
      
      {/* Unorthodox Nav - Top Bar minimal */}
      <div className="p-6 flex justify-between items-center border-b border-white/5">
        <button onClick={() => setView('GROUPS')} className="text-prowess-grey hover:text-white text-xs uppercase tracking-widest flex items-center gap-2">
          <ArrowLeft size={14} /> Groups
        </button>
        <h2 className="font-serif text-xl tracking-wide">{activeGroup?.name}</h2>
        <div className="text-xs text-prowess-red font-mono border border-prowess-red px-2 py-1 rounded-full">
          {activeGroup?.expenses.length} EXP
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        
        {/* Left Panel: Expenses & Input */}
        <div className="flex-1 flex flex-col border-r border-white/5 bg-stone-900/10">
          {/* Expense Input Area - Fixed Top */}
          <div className="p-6 border-b border-white/5 bg-black/50 backdrop-blur-sm z-10">
            <div className="flex flex-col gap-4">
               <input 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What was purchased?"
                  className="bg-transparent text-lg border-none outline-none placeholder-stone-700 text-white font-serif"
               />
               <div className="flex gap-4 items-center">
                 <div className="flex items-center border-b border-white/20 focus-within:border-prowess-red transition-colors flex-1">
                    <span className="text-prowess-red font-serif text-xl mr-2">$</span>
                    <input 
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent py-2 text-xl w-full outline-none text-white font-mono"
                    />
                 </div>
                 <select 
                    value={newPayer}
                    onChange={(e) => setNewPayer(e.target.value)}
                    className="bg-stone-900 border border-white/10 rounded-none px-4 py-2 text-sm outline-none focus:border-prowess-red text-prowess-beige"
                 >
                    <option value="" disabled>Paid By</option>
                    {activeGroup?.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                 </select>
                 <button 
                   onClick={handleAddExpense}
                   disabled={!newDesc || !newAmount || !newPayer}
                   className="bg-prowess-red w-10 h-10 flex items-center justify-center text-black hover:bg-white transition-colors disabled:opacity-50"
                 >
                   <Plus size={20} />
                 </button>
               </div>
            </div>
          </div>

          {/* Expense List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            {activeGroup?.expenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 transition-colors cursor-default">
                 <div>
                   <p className="text-white">{expense.description}</p>
                   <p className="text-xs text-prowess-grey mt-0.5">
                     {activeGroup.members.find(m => m.id === expense.paidBy)?.name} paid
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="font-mono text-prowess-red">{formatMoney(expense.amount)}</p>
                 </div>
              </div>
            ))}
            {activeGroup?.expenses.length === 0 && (
              <div className="text-center py-12 text-stone-800 text-sm uppercase tracking-widest">
                No data recorded
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Settlement - Always visible on desktop, stacked on mobile */}
        <div className="w-full sm:w-80 bg-stone-950/50 p-6 overflow-y-auto">
          <h3 className="text-prowess-grey text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Net Positions</h3>
          
          <div className="space-y-4 mb-12">
            {balances.map(b => {
               const member = activeGroup?.members.find(m => m.id === b.memberId);
               const isOwed = b.balance > 0;
               const isZero = Math.abs(b.balance) < 0.01;
               
               return (
                 <div key={b.memberId} className="flex justify-between items-center text-sm">
                    <span className="text-stone-400">{member?.name}</span>
                    <span className={`font-mono ${isZero ? 'text-stone-600' : isOwed ? 'text-green-500' : 'text-red-500'}`}>
                      {isZero ? '-' : (isOwed ? '+' : '-') + formatMoney(b.balance)}
                    </span>
                 </div>
               );
            })}
          </div>

          <h3 className="text-prowess-grey text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Settlement Plan</h3>
          <div className="space-y-4">
            {debts.map((debt, idx) => {
                const from = activeGroup?.members.find(m => m.id === debt.from);
                const to = activeGroup?.members.find(m => m.id === debt.to);
                return (
                  <div key={idx} className="bg-stone-900/50 p-4 border border-white/5 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-white">{from?.name}</span>
                       <span className="text-stone-600 text-xs">pays</span>
                       <span className="text-white">{to?.name}</span>
                    </div>
                    <div className="text-xl font-mono text-prowess-red">
                       {formatMoney(debt.amount)}
                    </div>
                  </div>
                );
            })}
            {debts.length === 0 && (
               <p className="text-stone-700 text-xs italic">No active debts.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SplitterApp;