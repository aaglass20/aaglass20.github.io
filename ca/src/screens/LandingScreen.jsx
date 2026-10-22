import { useEffect, useRef, useState } from 'react'
import { SLIDES, SLIDE_MS } from './landingSlides'
import './LandingScreen.css'

export default function LandingScreen({ onLogin, onSignup }) {
  const [index, setIndex]   = useState(0)
  const [prev, setPrev]     = useState(null)
  const [paused, setPaused] = useState(false)
  const [cycle, setCycle]   = useState(0)   // bumps to restart the current slide's timer + bar together
  const touchX = useRef(null)

  const slide = SLIDES[index]

  function goTo(next) {
    const n = (next + SLIDES.length) % SLIDES.length
    if (n === index) return
    setPrev(index)
    setIndex(n)
  }

  // Auto-advance; the timer resets on every slide change, so a tapped slide also gets the full 5s
  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => goTo(index + 1), SLIDE_MS)
    return () => clearTimeout(t)
  }, [index, paused, cycle])

  // Pause while the tab is hidden so we don't burn through slides in the background
  useEffect(() => {
    // Coming back restarts the current slide so the timer and progress bar line up again
    const onVis = () => {
      setPaused(document.hidden)
      if (!document.hidden) setCycle(c => c + 1)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Warm the cache so each photo is ready before its turn
  useEffect(() => {
    SLIDES.forEach(s => { new Image().src = s.image })
  }, [])

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1))
    touchX.current = null
  }

  return (
    <div
      className="landing-root"
      data-glow={slide.glow}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background — one glow layer per slide, crossfaded */}
      <div className="landing-bg" aria-hidden="true">
        {SLIDES.map((s, i) => (
          <div key={s.id} className={`landing-bg-layer glow-${s.glow} ${i === index ? 'is-active' : ''}`} />
        ))}
        <div key={`stripes-${index}`} className="landing-stripes" />
      </div>

      {/* Photo stack — incoming slide wipes over the outgoing one */}
      <div className="landing-photo-wrap">
        <div className="landing-photo-clip">
          {SLIDES.map((s, i) => (
            <img
              key={s.id}
              src={s.image}
              alt={i === index ? s.alt : ''}
              aria-hidden={i !== index}
              className={
                'landing-photo' +
                (i === index ? ' is-active' : '') +
                (i === prev ? ' is-leaving' : '')
              }
            />
          ))}
        </div>
      </div>

      {/* Copy — keyed by slide so each line re-runs its entrance animation */}
      <div className="landing-copy">
        <div className="landing-text" key={slide.id} aria-live="polite">
          <div className="landing-brand anim" style={{ '--i': 0 }}>
            <img src="/ca/images/coachApproachLogo-64.png" alt="" className="landing-mark" />
            <span>Coach Approach{slide.pro && <em> Pro</em>}</span>
          </div>

          <h1 className={`landing-headline ${slide.statement ? 'is-statement' : ''}`}>
            {slide.title.map((part, i) => (
              <span
                key={i}
                className={`landing-line anim ${part.accent ? 'is-accent' : ''}`}
                style={{ '--i': i + 1 }}
              >
                {part.t}
              </span>
            ))}
          </h1>

          {slide.tagline && (
            <p className="landing-tagline anim" style={{ '--i': 3 }}>
              {slide.tagline.map((part, i) =>
                <span key={i} className={part.accent ? 'is-accent' : ''}>{part.t}</span>
              )}
            </p>
          )}

          <p className="landing-sub anim" style={{ '--i': 4 }}>{slide.sub}</p>

          <ul className="landing-pillars">
            {slide.pillars.map((p, i) => (
              <li key={p} className="anim-pop" style={{ '--i': 5 + i }}>{p}</li>
            ))}
          </ul>
        </div>

        {/* Progress — each bar fills over SLIDE_MS; tap to jump */}
        <div className="landing-progress" role="tablist" aria-label="Coach Approach programs">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={s.title.map(p => p.t).join(' ')}
              className={`landing-dot ${i === index ? 'is-active' : ''} ${i < index ? 'is-done' : ''}`}
              onClick={() => goTo(i)}
            >
              <span
                key={i === index ? cycle : 'idle'}
                className="landing-dot-fill"
                style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
              />
            </button>
          ))}
        </div>

        <div className="landing-actions">
          <button type="button" className="landing-btn landing-btn-primary" onClick={onSignup}>
            Create Account
          </button>
          <button type="button" className="landing-btn landing-btn-secondary" onClick={onLogin}>
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}
