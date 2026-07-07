import React from 'react'

export default function Avatar({ user, size = 32, style = {}, onClick }) {
  if (!user) return null

  // If user has a selected avatar or a Google avatar, render the image
  const avatarUrl = user.avatar || user.googleAvatar

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${user.name}'s Avatar`}
        onClick={onClick}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          cursor: onClick ? 'pointer' : 'default',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s, border-color 0.2s',
          ...style,
        }}
        className="user-avatar-img"
      />
    )
  }

  // Fallback logic: Generate premium name-initials bubble styled with our accent gradient
  const nameLetter = user.name ? user.name.trim().charAt(0).toUpperCase() : '?'

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
        fontFamily: "'Geist Pixel', monospace",
        fontSize: Math.max(10, size * 0.38),
        fontWeight: 700,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s, border-color 0.2s',
        boxSizing: 'border-box',
        ...style,
      }}
      className="user-avatar-img"
    >
      {nameLetter}
    </div>
  )
}
