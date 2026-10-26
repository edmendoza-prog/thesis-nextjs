'use client';

import { useState } from 'react';
import UserAvatar from './UserAvatar';

export interface AvatarOption {
  id: string;
  name: string;
  seed: string;
  category: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  // Cartoon Kids (Avataaars)
  { id: 'kid-1', name: 'Sunny Sam', seed: 'avataaars:Sammy', category: 'Kids' },
  { id: 'kid-2', name: 'Clever Zoe', seed: 'avataaars:Zoe', category: 'Kids' },
  { id: 'kid-3', name: 'Super Max', seed: 'avataaars:Max', category: 'Kids' },
  { id: 'kid-4', name: 'Star Lily', seed: 'avataaars:Lily', category: 'Kids' },
  { id: 'kid-5', name: 'Bright Leo', seed: 'avataaars:Leo', category: 'Kids' },
  { id: 'kid-6', name: 'Joy Maya', seed: 'avataaars:Maya', category: 'Kids' },

  // Adventurers
  { id: 'adv-1', name: 'Dino Explorer', seed: 'adventurer:Alex', category: 'Adventurers' },
  { id: 'adv-2', name: 'Quest Oliver', seed: 'adventurer:Oliver', category: 'Adventurers' },
  { id: 'adv-3', name: 'Brave Scout', seed: 'adventurer:Scout', category: 'Adventurers' },
  { id: 'adv-4', name: 'Hero Luna', seed: 'adventurer:Luna', category: 'Adventurers' },

  // Playful Robots (Bottts)
  { id: 'bot-1', name: 'Sparky Bot', seed: 'bottts:Sparky', category: 'Robots' },
  { id: 'bot-2', name: 'Gizmo Champ', seed: 'bottts:Gizmo', category: 'Robots' },
  { id: 'bot-3', name: 'Pixel Pal', seed: 'bottts:Pixel', category: 'Robots' },
  { id: 'bot-4', name: 'Turbo Zoom', seed: 'bottts:Turbo', category: 'Robots' },

  // Friendly Emojis & Characters
  { id: 'fun-1', name: 'Happy Star', seed: 'fun-emoji:HappyStar', category: 'Emoji & Fun' },
  { id: 'fun-2', name: 'Cool Breeze', seed: 'fun-emoji:CoolBreeze', category: 'Emoji & Fun' },
  { id: 'fun-3', name: 'Sunny Smile', seed: 'lorelei:Sunny', category: 'Emoji & Fun' },
  { id: 'fun-4', name: 'Magic Wonder', seed: 'lorelei:Wonder', category: 'Emoji & Fun' },
];

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentSeed: string;
  onClose: () => void;
  onSelect: (newSeed: string) => void;
  title?: string;
  description?: string;
}

export default function AvatarPickerModal({
  isOpen,
  currentSeed,
  onClose,
  onSelect,
  title = 'Choose Your Avatar',
  description = 'Pick your favorite friendly cartoon character or click surprise to find a new one!',
}: AvatarPickerModalProps) {
  const [selectedSeed, setSelectedSeed] = useState<string>(currentSeed || 'avataaars:Sammy');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Kids', 'Adventurers', 'Robots', 'Emoji & Fun'];

  const filteredPresets = activeCategory === 'All'
    ? PRESET_AVATARS
    : PRESET_AVATARS.filter((item) => item.category === activeCategory);

  const handleRandomize = () => {
    const styles = ['avataaars', 'bottts', 'adventurer', 'fun-emoji', 'lorelei'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeedNum = Math.floor(Math.random() * 100000);
    setSelectedSeed(`${randomStyle}:hero_${randomSeedNum}`);
  };

  const handleConfirm = () => {
    onSelect(selectedSeed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-linear-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-slate-900">{title}</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Current Selection Live Preview Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md border-3 border-[#4255FF] p-1">
                <UserAvatar seed={selectedSeed} size={88} className="w-full h-full" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#4255FF] text-white text-xs shadow-sm">
                ✓
              </span>
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#4255FF]">Selected Avatar</p>
              <h3 className="font-heading text-lg font-bold text-slate-800 mt-0.5">
                {PRESET_AVATARS.find((p) => p.seed === selectedSeed)?.name || 'Custom / Surprise Seed'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This avatar will be visible on your dashboard, profile, and classroom activities.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-[#4255FF] border border-[#4255FF]/30 shadow-xs hover:bg-[#EDF0FF] transition cursor-pointer"
            >
              <span>🎲</span> Surprise Me!
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#4255FF] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Avatar Presets Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filteredPresets.map((avatar) => {
              const isSelected = selectedSeed === avatar.seed;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedSeed(avatar.seed)}
                  className={`group relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition cursor-pointer text-center ${
                    isSelected
                      ? 'border-[#4255FF] bg-[#EDF0FF]/50 shadow-md ring-2 ring-[#4255FF]/20 scale-102'
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-slate-50 p-1 mb-1.5 group-hover:scale-105 transition-transform">
                    <UserAvatar seed={avatar.seed} size={56} className="w-full h-full" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate w-full">
                    {avatar.name}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4255FF] text-white text-[9px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl bg-[#4255FF] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#4255FF]/20 hover:bg-[#3444D9] transition cursor-pointer"
          >
            <span>✨</span> Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
}
