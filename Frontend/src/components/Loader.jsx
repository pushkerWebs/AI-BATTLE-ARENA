import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Smooth random increments to reach 100% in ~1.2s
        const inc = Math.floor(Math.random() * 8) + 4
        return Math.min(prev + inc, 100)
      })
    }, 55)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete()
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [progress, onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 0.97,
        transition: { duration: 0.35, ease: 'easeOut' }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#070708',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e5e2e1',
        fontFamily: "'Geist Pixel', monospace",
      }}
    >
      {/* Cyan Glow Orb */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
          left: '15%',
          bottom: '15%',
        }}
      />
      {/* Blue Glow Orb */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
          right: '15%',
          top: '15%',
        }}
      />

      {/* Main Content Box */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '280px', zIndex: 10 }}>
        
        {/* Sleek pulsing gavel icon */}
        <motion.span 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="material-symbols-outlined" 
          style={{ 
            fontSize: 36, 
            color: '#06b6d4',
            marginBottom: 16,
            textShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}
        >
          gavel
        </motion.span>

        {/* Brand Text */}
        <div 
          className="font-brand"
          style={{
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '0.12em',
            color: '#ffffff',
            marginBottom: 20,
            textShadow: '0 0 12px rgba(255, 255, 255, 0.1)',
            textTransform: 'uppercase'
          }}
        >
          AI BATTLE ARENA
        </div>

        {/* Thin Sleek Progress Bar */}
        <div style={{
          width: '100%',
          height: 3,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          marginBottom: 14,
          border: '1px solid rgba(255, 255, 255, 0.02)',
        }}>
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
              width: `${progress}%`,
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)',
              transition: 'width 0.06s ease-out'
            }}
          />
        </div>

        {/* Minimal Percentage Counter */}
        <div style={{
          fontSize: 12,
          letterSpacing: '0.08em',
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}>
          <span>LOADING {progress}%</span>
        </div>
      </div>
    </motion.div>
  )
}
