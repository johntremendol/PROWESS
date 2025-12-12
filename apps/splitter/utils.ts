import { Group, Balance, Debt } from '../../types';

export const calculateBalances = (group: Group): Balance[] => {
  const balances: Record<string, number> = {};

  // Initialize zero balances
  group.members.forEach(m => balances[m.id] = 0);

  // Iterate expenses
  group.expenses.forEach(expense => {
    const amount = expense.amount;

    // Determine who is splitting this expense
    const splitMembers = expense.splitBetween && expense.splitBetween.length > 0
      ? expense.splitBetween
      : group.members.map(m => m.id);

    const splitCount = splitMembers.length;
    if (splitCount === 0) return; // Should not happen but safety check needed

    const splitAmount = amount / splitCount;

    // Handle both string (single payer) and PayerContribution[] (multi-payer)
    if (typeof expense.paidBy === 'string') {
      // Payer gets positive balance (owed money)
      if (balances[expense.paidBy] !== undefined) {
        balances[expense.paidBy] += amount;
      }
    } else if (Array.isArray(expense.paidBy)) {
      // Multi-payer: each payer gets credit for their contribution
      expense.paidBy.forEach(contrib => {
        if (balances[contrib.memberId] !== undefined) {
          balances[contrib.memberId] += contrib.amount;
        }
      });
    }

    // Deduct share from those involved in the split
    splitMembers.forEach(memberId => {
      if (balances[memberId] !== undefined) {
        balances[memberId] -= splitAmount;
      }
    });
  });

  return Object.keys(balances).map(id => ({
    memberId: id,
    balance: balances[id]
  }));
};

// Simplified debt matching algorithm
export const calculateDebts = (balances: Balance[]): Debt[] => {
  const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance); // Ascending (most negative first)
  const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance); // Descending (most positive first)

  const debts: Debt[] = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    debts.push({
      from: debtor.memberId,
      to: creditor.memberId,
      amount: amount
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return debts;
};