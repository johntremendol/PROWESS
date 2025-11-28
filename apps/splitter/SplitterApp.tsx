import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Group, Expense, Member } from '../../types';
import { calculateBalances, calculateDebts } from './utils';
import { analyzeExpenses, suggestSplitCategory } from '../../services/geminiService';
import { 
  ArrowLeft, Plus, Users, Receipt, TrendingUp, 
  DollarSign, Sparkles, Trash2, Check, ChevronRight 
} from '../../components/ui/Icons';

interface SplitterAppProps {
  onBack: () => void;
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' }
];

const INITIAL_GROUP: Group = {
  id: 'g1',
  name: 'Weekend Trip',
  currency: '$',
  members: INITIAL_MEMBERS,
  expenses: [
    { id: 'e1', description: 'Gas', amount: 45.00, paidBy: '1', date: '2023-10-27', category: 'Transport' },
    { id: 'e2', description: 'Groceries', amount: 120.50, paidBy: '2', date: '2023-10-27', category: 'Food' },
    { id: 'e3', description: 'Drinks', amount: 60.00, paidBy: '3', date: '2023-10-28', category: 'Entertainment' },
  ]
};

const SplitterApp: React.FC<SplitterAppProps> = ({ onBack }) => {
  const [group, setGroup] = useState<Group>(INITIAL_GROUP);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPayer, setNewPayer] = useState(group.members[0].id);

  // Derived State
  const balances = useMemo(() => calculateBalances(group), [group]);
  const debts = useMemo(() => calculateDebts(balances), [balances]);

  const handleAddExpense = async () => {
    if (!newDesc || !newAmount) return;

    // AI suggestion for category (background)
    const category = await suggestSplitCategory(newDesc);

    const expense: Expense = {
      id: Date.now().toString(),
      description: newDesc,
      amount: parseFloat(newAmount),
      paidBy: newPayer,
      date: new Date().toISOString().split('T')[0],
      category
    };

    setGroup(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));

    setNewDesc('');
    setNewAmount('');
    setShowAddModal(false);
    setAiAnalysis(null); // Clear old analysis as data changed
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeExpenses(group, debts);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const formatMoney = (amount: number) => {
    return `${group.currency}${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-prowess-dark text-stone-200 font-sans animate-fade-in relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-prowess-red opacity-10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-700 opacity-10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-prowess-dark/80 border-b border-white/5">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-stone-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-serif font-semibold tracking-wide">{group.name}</h1>
        <div className="w-10 h-10 rounded-full bg-prowess-red text-white flex items-center justify-center font-serif text-lg">
          $
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6">
        
        {/* Overview Card */}
        <div className="mt-6 mb-8 bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6 border border-white/5 shadow-xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-stone-400 text-sm font-medium uppercase tracking-wider mb-1">Total Expenses</p>
              <h2 className="text-3xl font-bold text-white">
                {group.currency}
                {group.expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
              </h2>
            </div>
            <div className="flex -space-x-2">
              {group.members.map(m => (
                <div key={m.id} className="w-8 h-8 rounded-full bg-stone-700 border-2 border-stone-800 flex items-center justify-center text-xs font-bold" title={m.name}>
                  {m.name[0]}
                </div>
              ))}
            </div>
          </div>
          <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-prowess-red w-3/4 opacity-80" /> 
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-stone-900/50 p-1 rounded-xl mb-6 border border-white/5">
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'expenses' ? 'bg-prowess-red text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
          >
            Expenses
          </button>
          <button 
            onClick={() => setActiveTab('balances')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'balances' ? 'bg-prowess-red text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
          >
            Balances
          </button>
        </div>

        {/* View Content */}
        {activeTab === 'expenses' ? (
          <div className="space-y-4 animate-slide-up">
            {group.expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-stone-900/40 rounded-xl border border-white/5 hover:bg-stone-800/60 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-prowess-red">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-prowess-red transition-colors">{expense.description}</h3>
                    <p className="text-xs text-stone-500">{expense.category} • Paid by {group.members.find(m => m.id === expense.paidBy)?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{group.currency}{expense.amount.toFixed(2)}</p>
                  <p className="text-xs text-stone-600">{expense.date}</p>
                </div>
              </div>
            ))}
            {group.expenses.length === 0 && (
              <div className="text-center py-10 text-stone-500">
                <p>No expenses yet. Start spending!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {/* Net Balances */}
            <div className="grid gap-3">
              {balances.map(b => {
                const member = group.members.find(m => m.id === b.memberId);
                const isOwed = b.balance > 0;
                const isZero = Math.abs(b.balance) < 0.01;
                return (
                  <div key={b.memberId} className="flex items-center justify-between p-3 rounded-lg border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold">
                         {member?.name[0]}
                      </div>
                      <span className="text-stone-300">{member?.name}</span>
                    </div>
                    <span className={`font-mono font-medium ${isZero ? 'text-stone-500' : isOwed ? 'text-green-400' : 'text-red-400'}`}>
                      {isZero ? 'Settled' : (isOwed ? '+' : '-') + formatMoney(b.balance)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* AI Analysis Section */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-500" />
                  AI Auditor
                </h3>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 transition-colors flex items-center gap-2"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Run Audit'}
                </button>
              </div>
              
              {aiAnalysis && (
                <div className="bg-stone-800/50 p-4 rounded-xl text-sm leading-relaxed text-stone-300 border border-yellow-500/20 animate-fade-in markdown-body">
                   <pre className="whitespace-pre-wrap font-sans">{aiAnalysis}</pre>
                </div>
              )}
            </div>

            {/* Settlement Plan */}
            <div className="bg-stone-900 rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">Settlement Plan</h3>
              <div className="space-y-3">
                {debts.length === 0 ? (
                  <p className="text-stone-500 italic">All settled up!</p>
                ) : (
                  debts.map((debt, idx) => {
                     const from = group.members.find(m => m.id === debt.from);
                     const to = group.members.find(m => m.id === debt.to);
                     return (
                       <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                             <span className="text-stone-300">{from?.name}</span>
                             <span className="text-stone-600 text-xs">pays</span>
                             <span className="text-stone-300">{to?.name}</span>
                          </div>
                          <span className="font-bold text-prowess-red">{formatMoney(debt.amount)}</span>
                       </div>
                     );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-prowess-red hover:bg-red-600 text-white rounded-full shadow-2xl shadow-red-900/50 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-30"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-6 border-t sm:border border-white/10 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif text-white">Add Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="text-stone-500 hover:text-white">
                <ArrowLeft className="rotate-[-90deg] sm:rotate-0" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1 uppercase tracking-wide">Description</label>
                <input 
                  type="text" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Dinner at Mario's"
                  className="w-full bg-stone-800 border-none rounded-lg p-3 text-white placeholder-stone-600 focus:ring-1 focus:ring-prowess-red outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-stone-500 mb-1 uppercase tracking-wide">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-stone-500">$</span>
                    <input 
                      type="number" 
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-stone-800 border-none rounded-lg p-3 pl-7 text-white placeholder-stone-600 focus:ring-1 focus:ring-prowess-red outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-stone-500 mb-1 uppercase tracking-wide">Paid By</label>
                  <select 
                    value={newPayer}
                    onChange={(e) => setNewPayer(e.target.value)}
                    className="w-full bg-stone-800 border-none rounded-lg p-3 text-white focus:ring-1 focus:ring-prowess-red outline-none appearance-none"
                  >
                    {group.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleAddExpense}
                className="w-full bg-prowess-red hover:bg-red-600 text-white font-medium py-3.5 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitterApp;