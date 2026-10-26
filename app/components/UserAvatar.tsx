import React from 'react';

export interface UserAvatarProps {
  seed: string;
  size?: number;
  className?: string;
  style?: string;
  alt?: string;
  onClick?: () => void;
}

export default function UserAvatar({
  seed,
  size = 100,
  className = '',
  style = 'avataaars',
  alt = 'User avatar',
  onClick,
}: UserAvatarProps) {
  // Support prefix-based styles like "bottts:seed123" or default to style prop
  let selectedStyle = style;
  let rawSeed = seed ? String(seed).trim() : 'User';

  if (!rawSeed) {
    rawSeed = 'User';
  }

  if (rawSeed.includes(':')) {
    const colonIndex = rawSeed.indexOf(':');
    selectedStyle = rawSeed.substring(0, colonIndex);
    rawSeed = rawSeed.substring(colonIndex + 1);
  }

  const avatarUrl = `https://api.dicebear.com/10.x/${encodeURIComponent(selectedStyle)}/svg?seed=${encodeURIComponent(rawSeed)}&size=${size}`;

  return (
    <img
      src={avatarUrl}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-circle rounded-full object-cover ${className} ${onClick ? 'cursor-pointer' : ''}`.trim()}
      onClick={onClick}
      loading="lazy"
    />
  );
}