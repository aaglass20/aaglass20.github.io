import { useState } from 'react'
import LiveMode from './components/LiveMode'
import UploadMode from './components/UploadMode'

export default function App() {
  const [tab, setTab] = useState('live')

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            <span className="app-logo__icon">&#127925;</span>
            <span className="app-logo__text">Stadium Edit</span>
          </div>
          <p className="app-tagline">School-safe warmup music — explicit content scrubbed</p>
        </div>
      </header>

      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === 'live' ? 'tab-btn--active' : ''}`}
          onClick={() => setTab('live')}
        >
          Live Scrub
        </button>
        <button
          className={`tab-btn ${tab === 'upload' ? 'tab-btn--active' : ''}`}
          onClick={() => setTab('upload')}
        >
          Upload &amp; Edit
        </button>
      </div>

      <main className="app-main">
        {tab === 'live' ? <LiveMode /> : <UploadMode />}
      </main>
    </div>
  )
}
