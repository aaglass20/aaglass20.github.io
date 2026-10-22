import { useState } from 'react'
import { SPORTS } from '../data/sports'
import './LoginScreen.css'
import './SignupWizard.css'

const STEPS = ['Account', 'Sport']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

export default function SignupWizard({ onBack, onLogin, onComplete }) {
  const [step, setStep]         = useState(0)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [sport, setSport]       = useState(null)
  const [touched, setTouched]   = useState(false)

  const errors = {
    name:     !name.trim() && 'Enter your name',
    email:    !EMAIL_RE.test(email.trim()) && 'Enter a valid email address',
    password: password.length < MIN_PASSWORD && `Use at least ${MIN_PASSWORD} characters`,
  }
  const accountValid = !errors.name && !errors.email && !errors.password

  function submitAccount(e) {
    e.preventDefault()
    setTouched(true)
    if (accountValid) setStep(1)
  }

  function finish() {
    onComplete({ name: name.trim(), email: email.trim().toLowerCase(), sport })
  }

  function back() {
    if (step === 0) onBack()
    else setStep(step - 1)
  }

  return (
    <div className="login-root wizard-root">
      {/* Hero band — back + step progress */}
      <div className="login-hero wizard-hero">
        <button type="button" className="login-back" onClick={back}>‹ Back</button>
        <img src="/ca/images/coachApproachLogo.png" alt="Coach Approach" className="wizard-logo" />
        <ol className="wizard-steps" aria-label="Sign-up progress">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`wizard-step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}
              aria-current={i === step ? 'step' : undefined}
            >
              <span className="wizard-step-num">{i < step ? '✓' : i + 1}</span>
              <span className="wizard-step-label">{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={`login-card wizard-card ${step === 1 ? 'is-wide' : ''}`}>
        {step === 0 && (
          <div className="wizard-panel" key="account">
            <h2 className="login-heading">Create your account</h2>
            <p className="login-sub">You'll be the admin for your program.</p>

            <form className="login-form" onSubmit={submitAccount} noValidate>
              <Field id="name" label="Full name" error={touched && errors.name}>
                <input
                  id="name"
                  type="text"
                  className="field-input"
                  placeholder="Coach Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  autoFocus
                />
              </Field>

              <Field
                id="email"
                label="Email"
                hint="This is your login ID."
                error={touched && errors.email}
              >
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  placeholder="coach@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                />
              </Field>

              <Field
                id="password"
                label="Password"
                hint={`At least ${MIN_PASSWORD} characters.`}
                error={touched && errors.password}
              >
                <div className="pw-wrap">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className="field-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </Field>

              <button type="submit" className="login-btn">Create Account</button>
            </form>

            <p className="login-signup">
              Already have an account?{' '}
              <button type="button" className="signup-link" onClick={onLogin}>Log in</button>
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="wizard-panel" key="sport">
            <h2 className="login-heading">What sport are you planning for?</h2>
            <p className="login-sub">
              We'll set up your drills, practice plans, and menus for this sport.
            </p>

            <div className="sport-grid" role="radiogroup" aria-label="Sport">
              {SPORTS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={sport === s.id}
                  className={`sport-card ${sport === s.id ? 'is-selected' : ''}`}
                  onClick={() => setSport(s.id)}
                >
                  <span className="sport-icon" aria-hidden="true">{s.icon}</span>
                  <span className="sport-label">{s.label}</span>
                  {s.blurb && <span className="sport-blurb">{s.blurb}</span>}
                </button>
              ))}
            </div>

            <button type="button" className="login-btn wizard-finish" disabled={!sport} onClick={finish}>
              Start Planning
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ id, label, hint, error, children }) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
      {error
        ? <span className="field-error" role="alert">{error}</span>
        : hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}
