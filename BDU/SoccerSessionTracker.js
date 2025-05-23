// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [completedSessions, setCompletedSessions] = useState([]);
  const TOTAL_SESSIONS = 365;

  const toggleSession = (sessionId) => {
    setCompletedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId);
      }
      return [...prev, sessionId];
    });
    // Here you would also update Google Sheets
  };

  return (
    <div className="app">
      <h1>Jordan's Soccer Sessions</h1>
      <div className="progress-counter">
        Completed: {completedSessions.length} / {TOTAL_SESSIONS}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(completedSessions.length / TOTAL_SESSIONS) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="sessions-grid">
        {Array.from({ length: TOTAL_SESSIONS }, (_, index) => (
          <div
            key={index}
            className={`session-box ${completedSessions.includes(index) ? 'completed' : ''}`}
            onClick={() => toggleSession(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;