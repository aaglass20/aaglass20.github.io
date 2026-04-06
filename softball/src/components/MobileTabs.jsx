import { useState } from 'react';
import './MobileTabs.css';

const TABS = [
  { id: 'situations', label: 'Situations' },
  { id: 'focus', label: 'Focus' },
  { id: 'names', label: 'Names' },
];

function MobileTabs({ children }) {
  const [activeTab, setActiveTab] = useState('situations');

  // children should be an object: { situations, focus, names }
  return (
    <div className="mobile-tabs">
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
          >
            {tab.label}
            <span className="tab-arrow">{activeTab === tab.id ? '▾' : '▸'}</span>
          </button>
        ))}
      </div>
      {activeTab && (
        <div className="tab-panel">
          {children[activeTab]}
        </div>
      )}
    </div>
  );
}

export default MobileTabs;
