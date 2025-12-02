import { GoogleGenAI } from "@google/genai";
import { Group, Debt } from "../types";

// Support both standard process.env (Node/Webpack) and Vite's import.meta.env
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize Gemini client:", e);
  }
}

export const analyzeExpenses = async (group: Group, debts: Debt[]) => {
  if (!ai) {
    return "Analysis unavailable: API key missing. Please set VITE_GEMINI_API_KEY in .env";
  }
  try {
    const memberMap = group.members.reduce((acc, m) => ({ ...acc, [m.id]: m.name }), {} as Record<string, string>);

    const expenseSummary = group.expenses.map(e => {
      // Get payer name - handle both string and array formats
      const payerName = typeof e.paidBy === 'string'
        ? memberMap[e.paidBy]
        : e.paidBy.map(p => memberMap[p.memberId]).join(' & ');

      return `${e.date}: ${payerName} paid ${group.currency}${e.amount} for ${e.description} (${e.category})`;
    }).join('\n');

    const debtSummary = debts.map(d =>
      `${memberMap[d.from]} owes ${memberMap[d.to]} ${group.currency}${d.amount.toFixed(2)}`
    ).join('\n');

    const prompt = `
      You are a witty financial auditor for a group of friends. 
      Analyze these expenses and the final settlement plan.
      
      Group Name: ${group.name}
      Expenses:
      ${expenseSummary}

      Calculated Settlements:
      ${debtSummary}

      Please provide:
      1. A short, humorous observation about their spending habits.
      2. A "MVP" (Most Valuable Payer).
      3. A "Freeloader Alert" (playful, for whoever owes the most).
      4. A quick confirmation that the settlement math looks sound.
      
      Keep it brief and fun. Use markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast response
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Could not generate analysis at this time. The auditors are on a break.";
  }
};

export const suggestSplitCategory = async (description: string): Promise<string> => {
  if (!ai) return 'General';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize this expense description into one word (e.g., Food, Transport, Utilities, Entertainment): "${description}"`,
    });
    return response.text?.trim() || 'General';
  } catch (e) {
    return 'General';
  }
}