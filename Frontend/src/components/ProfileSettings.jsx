import React from 'react'
import { motion } from 'framer-motion'
import { C } from '../constants/colors'
import Icon from './Icon'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function ProfileSettings({ isOpen, onClose }) {
  const { user } = useAuth()

  if (!isOpen || !user) return null

  // Format date helper
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A'

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0,
        zIndex: 180, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            zIndex: -1,
          }}
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            width: '100%', maxWidth: 440,
            background: `${C.surface}f2`,
            border: `1px solid ${C.outlineV}2a`,
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', gap: 24,
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{
              fontFamily: "'Michroma', sans-serif",
              fontSize: 16, color: C.onSurf, margin: 0,
              textTransform: 'uppercase', letterSpacing: '0.04em'
            }}>Profile Settings</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.onSurfVar, padding: 4, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.primary}
              onMouseLeave={e => e.currentTarget.style.color = C.onSurfVar}
            >
              <Icon n="close" size={20} />
            </button>
          </div>

          {/* Static Avatar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Avatar user={user} size={96} style={{ border: `2.5px solid ${C.primary}`, padding: 4, background: C.surfLow }} />
          </div>

          {/* User Details Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, color: C.onSurfVar, textTransform: 'uppercase', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>Full Name</label>
              <div style={{
                background: C.surfLow, border: `1px solid ${C.outlineV}22`,
                borderRadius: 10, padding: '12px 16px',
                fontSize: 13, color: C.onSurf, fontFamily: "'Helvetica', sans-serif",
              }}>
                {user.name}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, color: C.onSurfVar, textTransform: 'uppercase', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>Email Address</label>
              <div style={{
                background: C.surfLow, border: `1px solid ${C.outlineV}22`,
                borderRadius: 10, padding: '12px 16px',
                fontSize: 13, color: C.onSurfVar, fontFamily: "'Helvetica', sans-serif",
                opacity: 0.8,
              }}>
                {user.email}
              </div>
            </div>

            {/* Account Metadata Stats Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              marginTop: 8,
            }}>
              <div style={{ background: C.surfLow, border: `1px solid ${C.outlineV}11`, borderRadius: 10, padding: 12 }}>
                <span style={{ fontSize: 10, color: C.onSurfVar, fontFamily: "'Geist Pixel', monospace" }}>Total Battles</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginTop: 4 }}>{user.battleCount || 0}</div>
              </div>
              <div style={{ background: C.surfLow, border: `1px solid ${C.outlineV}11`, borderRadius: 10, padding: 12 }}>
                <span style={{ fontSize: 10, color: C.onSurfVar, fontFamily: "'Geist Pixel', monospace" }}>Member Since</span>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.onSurf, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{memberSince}</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px',
                background: C.primary, border: 'none',
                borderRadius: 10, color: C.onPrimary,
                fontFamily: "'Geist Pixel', monospace", fontSize: 12, fontWeight: 600,
                cursor: 'pointer', textAlign: 'center',
                boxShadow: `0 4px 16px ${C.primary}33`,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
