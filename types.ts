export enum AppView {
  LAUNCHER = 'LAUNCHER',
  SPLITTER = 'SPLITTER',
}

// Splitter Types
export interface Member {
  id: string;
  name: string;
  avatar?: string;
}

export interface PayerContribution {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string | PayerContribution[]; // Member ID or array for multi-payer support
  splitBetween?: string[]; // Array of Member IDs involved in the split (optional, defaults to all)
  date: string;
  category: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  currency: string;
}

export interface Balance {
  memberId: string;
  balance: number; // Positive = Owed to them, Negative = They owe
}

export interface Debt {
  from: string; // Member ID
  to: string; // Member ID
  amount: number;
}