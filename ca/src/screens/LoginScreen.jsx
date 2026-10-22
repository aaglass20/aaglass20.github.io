import { useState } from 'react'
import './LoginScreen.css'

export default function LoginScreen({ onBack, onSignup, onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Mock login — demo account is a Soccer coach with the BDU teams
    onLogin({ name: 'Coach', email: email.trim().toLowerCase(), sport: 'soccer' })
  }

  return (
    <div className="login-root">
      {/* Hero band */}
      <div className="login-hero">
        <button type="button" className="login-back" onClick={onBack} aria-label="Back">
          ‹ Back
        </button>
        <img src="/ca/images/coachApproachLogo.png" alt="Coach Approach" className="login-logo" />
      </div>

      {/* Form card */}
      <div className="login-card">
        <h2 className="login-heading">Welcome back, Coach</h2>
        <p className="login-sub">Sign in to your account</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="field-input"
              placeholder="coach@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="password">Password</label>
              <button type="button" className="forgot-link">Forgot password?</button>
            </div>
            <input
              id="password"
              type="password"
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <p className="login-signup">
          New to Coach Approach?{' '}
          <button type="button" className="signup-link" onClick={onSignup}>Create account</button>
        </p>
      </div>
    </div>
  )
}
