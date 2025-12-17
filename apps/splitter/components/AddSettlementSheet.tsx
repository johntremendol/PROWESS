import { useState, useEffect } from 'react';
import { Member } from '../../../types';
import RotatingDial from './RotatingDial';
import Avatar from './Avatar';

interface SettlementData {
    id?: string;
    paidBy: string;
    paidTo: string;
    amount: number;
    date: string;
}

interface AddSettlementSheetProps {
    members: Member[];
    currency: string;
    onAdd?: (settlement: Omit<SettlementData, 'id'>) => void;
    onUpdate?: (settlement: SettlementData) => void;
    onDelete?: () => void;
    initialSettlement?: SettlementData;
    onClose: () => void;
}

/**
 * AddSettlementSheet Component
 * 
 * Bottom sheet for recording settlements with:
 * - Scalloped red header
 * - PAID BY: Single payer selection
 * - PAID TO: Single recipient selection with amount display
 * - Rotating dial for amount input
 * - CONFIRM/UPDATE button
 * - DELETE button (in edit mode)
 */
const AddSettlementSheet: React.FC<AddSettlementSheetProps> = ({
    members,
    currency,
    onAdd,
    onUpdate,
    onDelete,
    initialSettlement,
    onClose,
}) => {
    const [paidBy, setPaidBy] = useState<string | null>(null);
    const [paidTo, setPaidTo] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Prevent body scroll when sheet is open
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (initialSettlement) {
            setPaidBy(initialSettlement.paidBy);
            setPaidTo(initialSettlement.paidTo);
            setTotalAmount(initialSettlement.amount);
        } else {
            // Default: first member as payer, second as recipient
            if (members.length > 0) {
                setPaidBy(prev => prev ?? members[0].id);
                if (members.length > 1) {
                    setPaidTo(prev => prev ?? members[1].id);
                }
            }
        }
    }, [members, initialSettlement]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 400);
    };

    const handleConfirm = () => {
        if (!paidBy || !paidTo || totalAmount <= 0 || paidBy === paidTo) {
            return;
        }

        const settlementData = {
            paidBy,
            paidTo,
            amount: totalAmount,
            date: initialSettlement?.date || new Date().toISOString(),
        };

        if (initialSettlement && onUpdate) {
            onUpdate({
                ...settlementData,
                id: initialSettlement.id,
            });
        } else if (onAdd) {
            onAdd(settlementData);
        }

        handleClose();
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this settlement?')) {
            onDelete?.();
            handleClose();
        }
    };

    const getCurrentDateTime = () => {
        const dateStr = initialSettlement?.date ? new Date(initialSettlement.date) : new Date();
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const day = days[dateStr.getDay()];
        const hours = dateStr.getHours();
        const minutes = dateStr.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${day} ${hour12}:${minutes} ${ampm}`;
    };

    const canConfirm = paidBy && paidTo && paidBy !== paidTo && totalAmount > 0;
    const isEditMode = !!initialSettlement;

    return (
        <>
            {/* Red Backdrop */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-90'
                    }`}
                style={{ backgroundColor: '#CC342C' }}
                onClick={handleClose}
            />

            {/* Sheet Content */}
            <div
                className={`fixed inset-x-0 bottom-0 z-50 bg-black flex flex-col transition-transform duration-400 ${isClosing ? 'translate-y-full' : 'translate-y-0'
                    }`}
                style={{
                    height: '80vh',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Scalloped Edge & Title Header */}
                <div className="relative w-full">
                    {/* Scalloped Edge SVG */}
                    <div className="absolute top-[-36px] left-0 w-full overflow-hidden leading-none z-50">
                        <svg
                            className="w-full h-[37px] text-black fill-current"
                            viewBox="0 0 430 37"
                            preserveAspectRatio="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M5.41797 0C6.72416 4.61649 10.9653 8 16 8C21.0347 8 25.2758 4.61649 26.582 0H44.418C45.7242 4.61649 49.9653 8 55 8C60.0347 8 64.2758 4.61649 65.582 0H83.418C84.7242 4.61649 88.9653 8 94 8C99.0347 8 103.276 4.61649 104.582 0H122.418C123.724 4.61649 127.965 8 133 8C138.035 8 142.276 4.61649 143.582 0H161.418C162.724 4.61649 166.965 8 172 8C177.035 8 181.276 4.61649 182.582 0H200.418C201.724 4.61649 205.965 8 211 8C216.035 8 220.276 4.61649 221.582 0H239.418C240.724 4.61649 244.965 8 250 8C255.035 8 259.276 4.61649 260.582 0H278.418C279.724 4.61649 283.965 8 289 8C294.035 8 298.276 4.61649 299.582 0H317.418C318.724 4.61649 322.965 8 328 8C333.035 8 337.276 4.61649 338.582 0H356.418C357.724 4.61649 361.965 8 367 8C372.035 8 376.276 4.61649 377.582 0H395.418C396.724 4.61649 400.965 8 406 8C411.035 8 415.276 4.61649 416.582 0H430V37H0V0H5.41797Z" />
                        </svg>
                    </div>

                    {/* Title Row */}
                    <div className="px-6 pt-6 pb-2 flex justify-between items-center">
                        <h2 className="text-label text-xs text-prowess-beige tracking-widest uppercase">
                            {isEditMode ? 'EDIT SETTLEMENT' : 'NEW SETTLEMENT'}
                        </h2>
                        <span className="text-label text-xs text-prowess-grey tracking-widest">{getCurrentDateTime()}</span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-2 pb-4 space-y-8">
                    {/* PAID BY Section */}
                    <div>
                        <p className="text-label text-xs text-prowess-grey mb-4">PAID BY</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            {members.map((member) => {
                                const isSelected = paidBy === member.id;
                                const isDisabled = paidTo === member.id;
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => !isDisabled && setPaidBy(member.id)}
                                        disabled={isDisabled}
                                        className={`rounded-full transition-all ${isSelected ? 'ring-2 ring-prowess-beige/60' : ''} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
                                        aria-pressed={isSelected}
                                        aria-label={`Paid by ${member.name}`}
                                    >
                                        <Avatar
                                            name={member.name}
                                            size="md"
                                            variant={isSelected ? 'filled' : 'outline'}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* PAID TO Section */}
                    <div className="flex flex-col gap-0">
                        <p className="text-label text-xs text-prowess-grey">PAID TO</p>
                        <div className="-mx-6 flex flex-col" style={{ gap: 0 }}>
                            {members.map((member) => {
                                const isSelected = paidTo === member.id;
                                const isDisabled = paidBy === member.id;
                                const displayAmount = isSelected ? totalAmount : 0;
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => !isDisabled && setPaidTo(member.id)}
                                        disabled={isDisabled}
                                        className={`w-full flex items-center justify-between px-6 py-3 transition-all border-0 outline-none focus:outline-none focus:ring-0 m-0 ${isSelected ? 'bg-[#1F1A17]' : 'bg-black'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#231d19]'}`}
                                        style={{ margin: 0, border: 'none', boxShadow: 'none' }}
                                        aria-pressed={isSelected}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={member.name}
                                                size="md"
                                                variant={isSelected ? 'filled' : 'outline'}
                                            />
                                            <span className="text-display text-lg text-prowess-beige">{member.name}</span>
                                        </div>
                                        <span className="text-display text-lg text-prowess-beige">
                                            {currency}{Math.round(displayAmount).toLocaleString()}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delete Button (Only in Edit Mode) */}
                    {isEditMode && onDelete && (
                        <div className="pt-4 px-0">
                            <button
                                onClick={handleDelete}
                                className="w-full h-[50px] flex items-center justify-center bg-prowess-red text-prowess-beige text-label text-sm tracking-widest font-bold uppercase hover:brightness-90 transition-all"
                            >
                                DELETE SETTLEMENT
                            </button>
                        </div>
                    )}

                    <div className="h-[300px]"></div>
                </div>

                {/* Fixed Bottom Section: Dial + Confirm Button */}
                <div className="flex-none relative w-full flex flex-col items-center justify-end pb-6 bg-black">
                    <RotatingDial
                        value={totalAmount}
                        onChange={setTotalAmount}
                        currency={currency}
                        min={0}
                        max={1000000}
                    />

                    {/* Gradient Overlay */}
                    <div
                        className="absolute bottom-0 left-0 right-0 pointer-events-none"
                        style={{
                            zIndex: 15,
                            height: '100px',
                            background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0) 100%)',
                        }}
                    />

                    {/* Confirm Button */}
                    <div className="w-full px-6 z-20">
                        <button
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className="w-full h-[42px] flex items-center justify-center bg-white text-black text-label text-sm tracking-widest font-bold uppercase disabled:bg-prowess-grey disabled:opacity-100 disabled:cursor-not-allowed hover:brightness-90 transition-all"
                        >
                            {isEditMode ? 'UPDATE' : 'CONFIRM'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddSettlementSheet;
