import React, { useEffect, useState } from 'react'

const GLITCH_CHARS = '!@#$%^&*<>?/\\|[]{}~'

function useGlitch(text, active) {
  const [display, setDisplay] = useState(text)
  useEffect(() => {
    if (!active) { setDisplay(text); return }
    let frame = 0
    const interval = setInterval(() => {
      if (frame > 12) { setDisplay(text); clearInterval(interval); return }
      setDisplay(
        text.split('').map((c, i) =>
          c === ' ' ? ' ' : (Math.random() > 0.5 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c)
        ).join('')
      )
      frame++
    }, 60)
    return () => clearInterval(interval)
  }, [active, text])
  return display
}

export default function NotFoundPage({ onNav }) {
  const [glitching, setGlitching] = useState(false)
  const [scanY, setScanY]   = useState(0)
  const [blink, setBlink]   = useState(true)

  const heading = useGlitch('404', glitching)
  const sub     = useGlitch('GAME OVER', glitching)

  // Animate the CRT scan beam
  useEffect(() => {
    const t = setInterval(() => setScanY(y => (y + 1) % 100), 18)
    return () => clearInterval(t)
  }, [])

  // Blink cursor
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530)
    return () => clearInterval(t)
  }, [])

  // Auto-glitch on mount
  useEffect(() => {
    setGlitching(true)
    const t = setTimeout(() => setGlitching(false), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--crt-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Drifting pixel clouds (ghostly on dark CRT bg) */}
      {[
        { w:200, h:100, top:'8%',  left:'70%', opacity:0.07, duration:'60s', delay:'0s'   },
        { w:140, h:70,  top:'18%', left:'85%', opacity:0.05, duration:'80s', delay:'-25s' },
        { w:170, h:85,  top:'4%',  left:'50%', opacity:0.06, duration:'50s', delay:'-40s' },
      ].map((c, i) => (
        <img key={i} src="/cloud-pixel.png" alt="" style={{
          position:'absolute', width:c.w, height:c.h, top:c.top, left:c.left,
          opacity:c.opacity, imageRendering:'pixelated', pointerEvents:'none',
          animation:`cloud-drift ${c.duration} linear ${c.delay} infinite`,
          zIndex:1,
        }} />
      ))}

      {/* Scanlines layer */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.38) 3px, rgba(0,0,0,0.38) 4px)',
      }} />

      {/* Moving scan beam */}
      <div style={{
        position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 3,
        top: `${scanY}%`, height: '3px',
        background: 'rgba(51,255,87,0.06)',
        transition: 'top 0.018s linear',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        padding: '48px 24px',
        maxWidth: 640,
      }}>

        {/* 404 number */}
        <div
          onMouseEnter={() => setGlitching(true)}
          onMouseLeave={() => setTimeout(() => setGlitching(false), 800)}
          style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(100px, 20vw, 180px)',
            lineHeight: 1,
            color: 'var(--crt-green)',
            textShadow: 'var(--glow-green)',
            letterSpacing: '0.05em',
            userSelect: 'none',
            cursor: 'default',
            filter: glitching ? 'blur(0.5px)' : 'none',
            transition: 'filter 0.06s',
          }}
        >
          {heading}
        </div>

        {/* GAME OVER */}
        <div style={{
          fontFamily: 'var(--pixel)',
          fontSize: 'clamp(12px, 3vw, 20px)',
          color: 'var(--nes-yellow)',
          textShadow: 'var(--glow-amber)',
          letterSpacing: '0.15em',
          marginBottom: 24,
          filter: glitching ? 'blur(1px)' : 'none',
          transition: 'filter 0.06s',
        }}>
          {sub}
        </div>

        {/* CRT terminal message */}
        <div style={{
          background: 'rgba(0,20,0,0.7)',
          border: '1px solid rgba(51,255,87,0.3)',
          borderRadius: 'var(--r-md)',
          padding: '20px 28px',
          marginBottom: 32,
          textAlign: 'left',
          fontFamily: 'var(--mono)',
          fontSize: 16,
          lineHeight: 2,
        }}>
          <div style={{ color: 'var(--gray-light)', marginBottom: 4, fontSize: 14, fontFamily: 'var(--pixel)' }}>
            SYSTEM ERROR LOG
          </div>
          {[
            { label: 'STATUS',    val: '404 NOT FOUND',            color: 'var(--nes-red)'    },
            { label: 'CARTRIDGE', val: 'NOT INSERTED / NOT FOUND', color: 'var(--nes-yellow)' },
            { label: 'MEMORY',    val: 'ADDRESS 0x00404 INVALID',  color: 'var(--crt-green)'  },
            { label: 'ACTION',    val: 'BLOW ON CARTRIDGE AND RETRY', color: 'var(--nes-sky)' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: 'var(--gray-light)', width: 80, flexShrink: 0, fontSize: 14 }}>{r.label}</span>
              <span style={{ color: r.color }}>{r.val}</span>
            </div>
          ))}
          <div style={{ color: 'var(--crt-green)', marginTop: 8 }}>
            <span>{'>'}</span>
            <span style={{ marginLeft: 8 }}>AWAITING INPUT</span>
            <span style={{
              display: 'inline-block', width: 9, height: 14,
              background: 'var(--crt-green)', marginLeft: 4,
              verticalAlign: 'middle',
              opacity: blink ? 1 : 0,
              transition: 'opacity 0.1s',
              boxShadow: 'var(--glow-green)',
            }} />
          </div>
        </div>

        {/* Navigation options styled as NES menu */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          maxWidth: 320, margin: '0 auto', marginBottom: 32,
        }}>
          {[
            { label: '▶  GO BACK HOME',        id: 'home',    color: 'var(--orange)',    glow: 'var(--glow-orange)' },
            { label: '▶  BROWSE ALL GAMES',    id: 'listing', color: 'var(--nes-yellow)', glow: 'var(--glow-amber)'  },
            { label: '▶  CONTACT SUPPORT',     id: 'contact', color: 'var(--crt-green)', glow: 'var(--glow-green)'  },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => onNav?.(item.id)}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '2px solid',
                borderColor: item.color,
                borderRadius: 0,
                color: item.color,
                fontFamily: 'var(--pixel)',
                fontSize: 14,
                padding: '14px 24px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textAlign: 'left',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow  = item.glow
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.5)'
                e.currentTarget.style.boxShadow  = 'none'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Footer tip */}
        <div style={{
          fontFamily: 'var(--pixel)', fontSize: 12,
          color: 'rgba(51,255,87,0.35)',
          letterSpacing: '0.1em',
          lineHeight: 2,
        }}>
          PRO TIP: IF THE GAME DOES NOT LOAD,<br />
          REMOVE CARTRIDGE AND BLOW GENTLY
        </div>
      </div>
    </div>
  )
}
