import React, { useEffect, useState } from 'react'

const SPARKLE_COUNT = 12

function Sparkle({ style }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full"
      style={{
        background: '#76b900',
        boxShadow: '0 0 6px 2px rgba(118,185,0,0.6)',
        ...style,
      }}
    />
  )
}

function generateSparkles() {
  return Array.from({ length: SPARKLE_COUNT }, (_, i) => {
    const angle = (i / SPARKLE_COUNT) * 360
    const radius = 90 + Math.random() * 40
    const rad = (angle * Math.PI) / 180
    const x = 50 + Math.cos(rad) * radius * 0.35
    const y = 50 + Math.sin(rad) * radius * 0.35
    const delay = i * 60
    const size = 6 + Math.random() * 6
    return { x, y, delay, size, id: i }
  })
}

export default function PRCelebration({ exercise, value, unit, improvement, onClose }) {
  const [sparkles] = useState(generateSparkles)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      {/* Sparkle layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {sparkles.map((sp) => (
          <div
            key={sp.id}
            className="absolute"
            style={{
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0)',
              transition: `opacity 0.4s ease ${sp.delay}ms, transform 0.4s ease ${sp.delay}ms`,
            }}
          >
            <Sparkle
              style={{
                width: sp.size,
                height: sp.size,
                marginLeft: -(sp.size / 2),
                marginTop: -(sp.size / 2),
              }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 px-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.5)',
          transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Trophy */}
        <div
          className="text-[80px] leading-none"
          style={{
            filter: 'drop-shadow(0 0 24px rgba(118,185,0,0.5))',
            animation: visible ? 'pr-bounce 0.6s ease 0.3s both' : 'none',
          }}
        >
          🏆
        </div>

        {/* Heading */}
        <div>
          <p
            className="text-[13px] font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: 'rgba(118,185,0,0.7)' }}
          >
            Recorde pessoal
          </p>
          <h1
            className="text-[36px] font-black leading-none"
            style={{ color: '#76b900' }}
          >
            Novo PR!
          </h1>
        </div>

        {/* Exercise name */}
        <p
          className="text-[20px] font-bold"
          style={{ color: 'var(--theme-text)' }}
        >
          {exercise}
        </p>

        {/* Value badge */}
        <div
          className="px-8 py-4 rounded-2xl"
          style={{
            background: 'rgba(118,185,0,0.12)',
            border: '2px solid rgba(118,185,0,0.4)',
          }}
        >
          <span
            className="text-[42px] font-black leading-none"
            style={{ color: '#76b900' }}
          >
            {value}
          </span>
          {unit && (
            <span
              className="text-[22px] font-bold ml-2"
              style={{ color: 'rgba(118,185,0,0.7)' }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Improvement badge */}
        {improvement && (
          <div
            className="px-4 py-2 rounded-full text-[14px] font-bold"
            style={{
              background: 'rgba(118,185,0,0.1)',
              color: '#76b900',
              border: '1px solid rgba(118,185,0,0.3)',
            }}
          >
            +{improvement} vs anterior
          </div>
        )}

        {/* Stars decoration */}
        <div className="flex gap-3 mt-1">
          {['⭐', '🌟', '⭐'].map((star, i) => (
            <span
              key={i}
              className="text-2xl"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
                transition: `opacity 0.4s ease ${0.4 + i * 0.1}s, transform 0.4s ease ${0.4 + i * 0.1}s`,
              }}
            >
              {star}
            </span>
          ))}
        </div>

        {/* Close button */}
        <button
          className="btn-primary mt-4 px-10"
          onClick={onClose}
          style={{ fontSize: '17px' }}
        >
          Incrível! 💪
        </button>
      </div>

      <style>{`
        @keyframes pr-bounce {
          0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.1) rotate(5deg);  opacity: 1; }
          80%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
