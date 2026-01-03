import React, { forwardRef } from 'react';
import { Group, Expense } from '../../../types';
import Avatar from './Avatar';

interface PDFReportProps {
    group: Group;
    expenses: Expense[];
    settlements: {
        id: string;
        from: string;
        to: string;
        amount: number;
        currency: string;
    }[];
    totalExpense: number;
}

const PDFReport = forwardRef<HTMLDivElement, PDFReportProps>(({ group, expenses, settlements, totalExpense }, ref) => {
    return (
        <div
            ref={ref}
            className="bg-black text-prowess-beige w-[400px] flex flex-col"
            style={{
                minHeight: '600px',
                padding: '24px 20px',
                overflow: 'visible'
            }}
        >
            {/* HEADER */}
            <div className="flex flex-col gap-3 border-b border-prowess-grey/20 pb-4 mb-6">
                <h1 className="text-display text-2xl italic text-prowess-beige leading-tight">{group.name}</h1>
                <div className="flex justify-between items-end">
                    <p className="text-label text-[10px] text-prowess-grey tracking-widest uppercase">GROUP REPORT</p>
                    <div className="text-right">
                        <p className="text-display text-xl text-prowess-beige italic leading-none">
                            {group.currency}{Math.round(totalExpense).toLocaleString()}
                        </p>
                        <p className="text-label text-[8px] text-prowess-grey tracking-widest uppercase mt-1">TOTAL SPEND</p>
                    </div>
                </div>
            </div>

            {/* MEMBERS SECTION */}
            <div className="mb-6">
                <h2 className="text-label text-[10px] text-prowess-grey tracking-widest uppercase mb-3 border-b border-prowess-grey/20 pb-2">MEMBERS</h2>
                <div className="flex flex-wrap gap-2">
                    {group.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 bg-[#1F1A17] px-3 py-1.5 border border-prowess-grey/10" style={{ borderRadius: '20px' }}>
                            <Avatar name={member.name} size="sm" variant="outline" />
                            <span className="text-display text-sm text-prowess-beige" style={{ fontFamily: 'Palatino, "Palatino Linotype", serif' }}>{member.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* EXPENSES SECTION */}
            <div className="mb-6">
                <h2 className="text-label text-[10px] text-prowess-grey tracking-widest uppercase mb-3 border-b border-prowess-grey/20 pb-2">ALL EXPENSES</h2>
                <div className="flex flex-col gap-1">
                    {expenses.length === 0 ? (
                        <p className="text-prowess-grey italic text-xs py-2">No expenses recorded.</p>
                    ) : (
                        expenses.map((expense) => {
                            let payerName = 'Unknown';
                            if (typeof expense.paidBy === 'string') {
                                payerName = group.members.find(m => m.id === expense.paidBy)?.name || 'Unknown';
                            } else if (Array.isArray(expense.paidBy) && expense.paidBy.length > 0) {
                                const firstPayerId = (expense.paidBy[0] as any).memberId;
                                const firstPayer = group.members.find(m => m.id === firstPayerId);
                                payerName = expense.paidBy.length > 1 ? `${firstPayer?.name} +${expense.paidBy.length - 1}` : (firstPayer?.name || 'Unknown');
                            }

                            return (
                                <div key={expense.id} className="flex justify-between items-center py-2 border-b border-white/5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-display text-base text-prowess-beige italic leading-tight" style={{ fontFamily: 'Palatino, "Palatino Linotype", serif' }}>{expense.description}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] text-prowess-grey uppercase tracking-widest bg-white/5 px-1.5 py-0.5" style={{ borderRadius: '3px', fontFamily: 'DIN, sans-serif' }}>
                                                {expense.category || 'general'}
                                            </span>
                                            <span className="text-[10px] text-prowess-grey" style={{ fontFamily: 'DIN, sans-serif' }}>
                                                Paid by <span className="text-prowess-beige">{payerName}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-display text-base text-prowess-beige italic leading-none" style={{ fontFamily: 'Palatino, "Palatino Linotype", serif' }}>
                                        {group.currency}{Math.round(expense.amount).toLocaleString()}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* SETTLEMENTS SECTION */}
            <div className="mb-6">
                <h2 className="text-label text-[10px] text-prowess-grey tracking-widest uppercase mb-3 border-b border-prowess-grey/20 pb-2">SETTLEMENTS</h2>
                <div className="flex flex-col gap-2 border border-prowess-grey/10 overflow-hidden" style={{ borderRadius: '8px' }}>
                    {settlements.length === 0 ? (
                        <div className="p-3 text-prowess-grey italic text-xs text-center">No settlements required yet.</div>
                    ) : (
                        settlements.map((settlement, idx) => {
                            const fromMember = group.members.find(m => m.id === settlement.from);
                            const toMember = group.members.find(m => m.id === settlement.to);
                            if (!fromMember || !toMember) return null;

                            return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#1F1A17] border-b border-black last:border-0">
                                    <div className="flex items-center gap-2 w-[100px]">
                                        <Avatar name={fromMember.name} size="sm" variant="outline" />
                                        <span className="text-[9px] text-prowess-grey truncate" style={{ fontFamily: 'DIN, sans-serif' }}>{fromMember.name}</span>
                                    </div>

                                    <div className="flex-1 flex items-center px-2">
                                        <div className="flex-1 h-px bg-prowess-red/50 mx-1"></div>
                                        <span className="text-display text-sm text-prowess-beige italic whitespace-nowrap px-1" style={{ fontFamily: 'Palatino, "Palatino Linotype", serif' }}>
                                            {settlement.currency}{Math.round(settlement.amount).toLocaleString()}
                                        </span>
                                        <div className="flex-1 flex items-center mx-1 relative">
                                            <div className="w-full h-px bg-prowess-red/50"></div>
                                            <div className="absolute" style={{
                                                right: '-3px',
                                                width: 0,
                                                height: 0,
                                                borderTop: '3px solid transparent',
                                                borderBottom: '3px solid transparent',
                                                borderLeft: '4px solid rgba(204, 52, 44, 0.5)'
                                            }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-[100px] justify-end">
                                        <span className="text-[9px] text-prowess-grey truncate" style={{ fontFamily: 'DIN, sans-serif' }}>{toMember.name}</span>
                                        <Avatar name={toMember.name} size="sm" variant="outline" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-8 flex justify-center">
                <div className="flex items-center gap-2 opacity-30">
                    <div className="w-1.5 h-1.5 bg-prowess-red" style={{ borderRadius: '50%' }}></div>
                    <span className="text-label text-[8px] tracking-[0.2em] text-prowess-beige uppercase" style={{ fontFamily: 'DIN, sans-serif' }}>GENERATED BY PROWESS</span>
                </div>
            </div>
        </div>
    );
});

PDFReport.displayName = 'PDFReport';

export default PDFReport;
