import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { signUp, login } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !pin.trim()) {
      setError('Name and PIN are required');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 characters');
      return;
    }
    if (isSignUp && (!birthYear || birthYear < 1940 || birthYear > currentYear)) {
      setError('Please enter a valid birth year');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUp(name.trim(), pin, parseInt(birthYear));
        if (result.success) navigate('/timeline');
        else setError(result.error || 'Sign up failed');
      } else {
        const result = await login(name.trim(), pin);
        if (result.success) navigate('/timeline');
        else setError(result.error || 'Invalid name or PIN');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <h1 className="login-title">
          Soundtrack of a Lifetime
        </h1>
        <p className="login-tagline">Every life has a soundtrack. What's yours?</p>
      </div>

      <div className="login-card">
        <div className="login-tabs">
          <button
            className={`login-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
          />
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="PIN (4+ characters)"
          />
          {isSignUp && (
            <input
              type="number"
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              placeholder="Birth year (e.g. 1990)"
              min="1940"
              max={currentYear}
            />
          )}
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="login-about">
        <div className="about-section">
          <h3 className="about-heading">How It Works</h3>
          <p>Sign up with a username, password, and the year you were born. Your musical journey begins instantly.</p>
          <p>Choose <strong>one song for every year of your life</strong>. It can be a hit from that year, or a song that personally represents who you were during that time.</p>
          <p>Relive your story — one song at a time.</p>
        </div>

        <div className="about-section">
          <h3 className="about-heading">Build Your Legacy Lists</h3>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">Top 25</span>
              <span>Songs of All Time</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">Top 10</span>
              <span>Albums of All Time</span>
            </div>
          </div>
          <p>With smooth drag-and-drop, add songs and albums anytime and rearrange your rankings whenever your heart changes.</p>
        </div>

        <div className="about-section">
          <h3 className="about-heading">Discover & Connect</h3>
          <p>Browse other users' soundtracks. Find hidden gems, rediscover forgotten favorites, and see how different lives are shaped by different songs.</p>
          <p>When you favorite a song, it gets added to <strong>The Super Chart</strong> — a living, breathing musical time capsule built by everyone.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;