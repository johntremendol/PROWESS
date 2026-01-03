import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from '../../../components/ui/Icons';
import Avatar, { getInitials } from './Avatar';
import { Group } from '../../../types';

interface EditGroupSheetProps {
    group: Group;
    onUpdateGroup: (name: string, members: { id: string | null; name: string; email?: string }[], currency: string) => void;
    onClose: () => void;
}

// Comprehensive list of major world currencies with codes
const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'dollar $' },
    { code: 'INR', symbol: 'Rs.', label: 'rupee Rs.' },
    { code: 'EUR', symbol: '€', label: 'euro €' },
    { code: 'GBP', symbol: '£', label: 'pound £' },
    { code: 'JPY', symbol: '¥', label: 'yen ¥' },
    { code: 'AUD', symbol: 'A$', label: 'australian $' },
    { code: 'CAD', symbol: 'C$', label: 'canadian $' },
    { code: 'CHF', symbol: 'Fr', label: 'swiss franc' },
    { code: 'CNY', symbol: '¥', label: 'yuan ¥' },
    { code: 'SGD', symbol: 'S$', label: 'singapore $' },
    { code: 'AED', symbol: 'د.إ', label: 'dirham' },
    { code: 'THB', symbol: '฿', label: 'baht ฿' },
];

/**
 * EditGroupSheet Component
 * 
 * Edit group details (name, currency, members).
 * Visualization matches CreateFlow but presented as a slide-up sheet.
 */
const EditGroupSheet: React.FC<EditGroupSheetProps> = ({ group, onUpdateGroup, onClose }) => {
    // Initialize state from existing group
    const [groupName, setGroupName] = useState(group.name);
    const [currencyIndex, setCurrencyIndex] = useState(
        Math.max(0, CURRENCIES.findIndex(c => c.symbol === group.currency || c.code === group.currency))
    );

    // Mixed existing (has ID) and new (id=null for now) members
    const [members, setMembers] = useState<{ id: string | null; name: string; email?: string }[]>(
        group.members.map(m => ({ id: m.id, name: m.name, email: m.email || undefined }))
    );

    const [memberName, setMemberName] = useState('');
    const [isNameEditing, setIsNameEditing] = useState(false);
    const [isMemberInputVisible, setIsMemberInputVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const memberInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setIsVisible(true));

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        if (isMemberInputVisible) {
            memberInputRef.current?.focus();
        }
    }, [isMemberInputVisible]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 400);
    };

    const handleNameClick = () => {
        setIsNameEditing(true);
        setTimeout(() => nameInputRef.current?.focus(), 0);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idx = CURRENCIES.findIndex(c => c.code === e.target.value);
        if (idx !== -1) setCurrencyIndex(idx);
    };

    const handleAddMember = () => {
        if (!memberName.trim()) return;

        const newInitials = getInitials(memberName.trim());
        const existingInitials = members.map(m => getInitials(m.name));

        if (existingInitials.includes(newInitials)) {
            alert(`Member initials "${newInitials}" already exist in this group. Please use a distinct name.`);
            return;
        }

        setMembers([...members, { id: null, name: memberName.trim() }]);
        setMemberName('');
        memberInputRef.current?.focus();
    };

    const handleMemberKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddMember();
        }
        if (e.key === 'Escape') {
            setIsMemberInputVisible(false);
            setMemberName('');
        }
    };

    const handleRemoveMember = (index: number) => {
        // Note: Removing existing members might be blocked by backend if they have expenses
        // But we update state here regardless
        setMembers(members.filter((_, i) => i !== index));
    };

    // Also allow editing existing member names
    const handleEditMemberName = (index: number, newName: string) => {
        const trimmedName = newName.trim();
        if (trimmedName) {
            const newInitials = getInitials(trimmedName);
            const otherMembersInitials = members
                .filter((_, i) => i !== index)
                .map(m => getInitials(m.name));

            if (otherMembersInitials.includes(newInitials)) {
                // We'll allow typing, but maybe highlight it? 
                // For simplicity here, we'll just let them edit but handle the conflict in handleUpdate
                // Or prevent the change if it conflicts. Let's prevent it to be consistent.
                // However, while typing it's annoying. Let's check on Blur or Update.
            }
        }
        const newMembers = [...members];
        newMembers[index].name = newName;
        setMembers(newMembers);
    };

    const handleUpdate = () => {
        if (groupName.trim() && members.length >= 2) {
            // Final check for unique initials before saving
            const initialsSet = new Set();
            for (const m of members) {
                const initials = getInitials(m.name);
                if (initialsSet.has(initials)) {
                    alert(`Multiple members have the same initials (${initials}). Please ensure all members have unique names.`);
                    return;
                }
                initialsSet.add(initials);
            }

            onUpdateGroup(groupName.trim(), members, CURRENCIES[currencyIndex].symbol);
            handleClose();
        }
    };

    const canUpdate = groupName.trim() && members.length >= 2;

    return (
        <>
            {/* Beige Backdrop */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-500 ease-out-quint ${!isVisible || isClosing ? 'opacity-0' : 'opacity-100'}`}
                style={{
                    backgroundColor: 'rgba(214, 207, 191, 0.25)', // D6CFBF at 25% opacity
                    backdropFilter: 'blur(1px)',
                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                onClick={handleClose}
            />

            {/* Sheet Content - Slide Up */}
            <div
                className={`fixed inset-x-0 bottom-0 z-50 bg-black flex flex-col transition-transform duration-500 ${!isVisible || isClosing ? 'translate-y-full' : 'translate-y-0'}`}
                style={{
                    height: '85vh',
                    transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
                }}
            >
                {/* Red Header Banner Portion */}
                {/* Header Banner Portion - Black & Left Aligned */}
                <div
                    className="w-full py-6 px-6 relative flex items-center justify-start shrink-0 bg-black"
                    onClick={handleClose}
                >
                    <h2 className="text-label text-xs text-prowess-beige tracking-widest uppercase">EDIT GROUP</h2>
                </div>

                {/* Black Content Area */}
                <div className="flex-1 bg-black flex flex-col overflow-hidden">
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-6 pb-4 space-y-6">

                        {/* GROUP NAME Section */}
                        <div className="border-b border-prowess-grey/20 pb-3">
                            <div className="flex items-end justify-between gap-4">
                                <p className="text-label text-xs text-prowess-grey mb-1 flex-none">GROUP NAME</p>
                                {isNameEditing ? (
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        onBlur={() => setIsNameEditing(false)}
                                        placeholder="group name"
                                        className="text-display text-2xl text-prowess-beige bg-transparent outline-none text-right flex-1 min-w-0 placeholder:opacity-50 italic"
                                    />
                                ) : (
                                    <div
                                        onClick={handleNameClick}
                                        className="text-display text-2xl text-prowess-beige cursor-pointer text-right flex-1 min-w-0 truncate italic"
                                        style={{ opacity: groupName ? 1 : 0.5 }}
                                    >
                                        {groupName}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CURRENCY Section */}
                        <div className="border-b border-prowess-grey/20 pb-3">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-label text-xs text-prowess-grey flex-none">CURRENCY</p>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={CURRENCIES[currencyIndex].code}
                                        onChange={handleCurrencyChange}
                                        className="appearance-none bg-transparent text-display text-2xl text-prowess-beige italic cursor-pointer focus:outline-none text-right"
                                        style={{
                                            fontFamily: 'inherit',
                                            WebkitAppearance: 'none',
                                            MozAppearance: 'none',
                                            direction: 'rtl',
                                        }}
                                    >
                                        {CURRENCIES.map((currency) => (
                                            <option
                                                key={currency.code}
                                                value={currency.code}
                                                className="bg-black text-prowess-beige"
                                                style={{ direction: 'ltr' }}
                                            >
                                                {currency.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex flex-col items-center flex-shrink-0" style={{ lineHeight: 0.7 }}>
                                        <span className="text-prowess-grey text-[10px]">◆</span>
                                        <span className="text-prowess-grey text-[10px] rotate-180">◆</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MEMBERS Section */}
                        <div className="flex flex-col gap-0">
                            <p className="text-label text-xs text-prowess-grey mb-3">MEMBERS</p>

                            {/* Add Members Button */}
                            <div className="-mx-6">
                                {isMemberInputVisible ? (
                                    <div
                                        className="flex items-center gap-3 px-6 py-4"
                                        style={{ backgroundColor: '#CC342C' }}
                                    >
                                        <button
                                            onClick={handleAddMember}
                                            className="w-9 h-9 rounded-full border border-prowess-beige/50 flex items-center justify-center hover:bg-prowess-beige/10 transition-colors flex-shrink-0"
                                        >
                                            <Plus size={18} className="text-prowess-beige" />
                                        </button>
                                        <input
                                            ref={memberInputRef}
                                            type="text"
                                            value={memberName}
                                            onChange={(e) => setMemberName(e.target.value)}
                                            onKeyDown={handleMemberKeyDown}
                                            onBlur={() => {
                                                if (!memberName.trim()) setIsMemberInputVisible(false);
                                            }}
                                            placeholder="member name"
                                            className="flex-1 bg-transparent py-2 text-lg text-prowess-beige placeholder-prowess-beige/50 focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsMemberInputVisible(true)}
                                        className="w-full flex items-center gap-3 px-6 py-4 hover:brightness-110 transition-all"
                                        style={{ backgroundColor: '#CC342C' }}
                                    >
                                        <div className="w-9 h-9 rounded-full border border-prowess-beige/50 flex items-center justify-center">
                                            <Plus size={18} className="text-prowess-beige" />
                                        </div>
                                        <span className="text-display text-xl text-prowess-beige italic">Add Members</span>
                                    </button>
                                )}
                            </div>

                            {/* Members List - Editable */}
                            <div className="-mx-6 flex flex-col" style={{ gap: 0 }}>
                                {members.map((member, index) => (
                                    <div
                                        key={index}
                                        className="w-full flex items-center justify-between px-6 py-4 transition-all bg-[#1F1A17] hover:bg-[#231d19]"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <Avatar
                                                name={member.name}
                                                size="md"
                                                variant="outline"
                                            />
                                            <div className="flex flex-col flex-1 gap-1">
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => handleEditMemberName(index, e.target.value)}
                                                    placeholder="name"
                                                    className="bg-transparent text-display text-lg text-prowess-beige focus:outline-none border-b border-transparent focus:border-prowess-beige/50 w-full"
                                                />
                                                <input
                                                    type="email"
                                                    value={member.email || ''}
                                                    onChange={(e) => {
                                                        const newMembers = [...members];
                                                        newMembers[index] = { ...member, email: e.target.value };
                                                        setMembers(newMembers);
                                                    }}
                                                    placeholder="add email to connect"
                                                    className="bg-transparent text-label text-xs text-prowess-grey focus:outline-none border-b border-transparent focus:border-prowess-beige/30 w-full placeholder:text-prowess-grey/30"
                                                />
                                            </div>
                                        </div>
                                        {/* Only show trash if it's a new member or if we handle deletion properly */}
                                        {/* For now allowing deletion UI but backend might reject if expenses exist */}
                                        <button
                                            onClick={() => handleRemoveMember(index)}
                                            className="text-label text-xs text-prowess-grey hover:text-prowess-beige transition-colors uppercase tracking-widest pl-4"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[100px]"></div>
                    </div>

                    {/* Fixed Bottom Section: Update Button */}
                    <div className="flex-none w-full px-6 pb-6 pt-4 bg-black z-20">
                        <button
                            onClick={handleUpdate}
                            disabled={!canUpdate}
                            className="w-full h-[48px] flex items-center justify-center bg-white text-black text-label text-sm tracking-widest font-bold uppercase disabled:bg-prowess-grey disabled:opacity-100 disabled:cursor-not-allowed hover:brightness-90 transition-all"
                        >
                            UPDATE GROUP
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditGroupSheet;
