import { useState, useRef, useEffect } from 'react';
import './MobileTabs.css';

function MobileTabs({ situations, activeSituation, onSelect, focusPanel, namePanel }) {
  const [showPanel, setShowPanel] = useState(null); // 'focus' | 'names' | null
  const scrollRef = useRef(null);

  // Group situations by category
  const categories = {};
  for (const sit of situations) {
    const cat = sit.category || 'Uncategorized';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(sit);
  }
  const categoryNames = Object.keys(categories);
  const [activeCategory, setActiveCategory] = useState(
    activeSituation?.category || categoryNames[0] || ''
  );

  const currentPlays = categories[activeCategory] || [];

  // Scroll active card into view when situation changes
  useEffect(() => {
    if (scrollRef.current && activeSituation) {
      const activeCard = scrollRef.current.querySelector('.m-card.active');
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeSituation]);

  return (
    <div className="mobile-tabs">
      {/* Current play title */}
      <div className="m-now-playing">
        <div className="m-now-label">Now Playing</div>
        <div className="m-now-title">{activeSituation?.title || 'Select a play'}</div>
        <div className="m-now-desc">{activeSituation?.description || ''}</div>
      </div>

      {/* Category tabs */}
      <div className="m-category-bar">
        {categoryNames.map((cat) => (
          <button
            key={cat}
            className={`m-cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            <span className="m-cat-count">{categories[cat].length}</span>
          </button>
        ))}
        <div className="m-cat-spacer" />
        <button
          className={`m-icon-btn ${showPanel === 'focus' ? 'active' : ''}`}
          onClick={() => setShowPanel(showPanel === 'focus' ? null : 'focus')}
          title="Position Focus"
        >
          Focus
        </button>
        <button
          className={`m-icon-btn ${showPanel === 'names' ? 'active' : ''}`}
          onClick={() => setShowPanel(showPanel === 'names' ? null : 'names')}
          title="Player Names"
        >
          Names
        </button>
      </div>

      {/* Swipeable play cards */}
      <div className="m-cards-scroll" ref={scrollRef}>
        {currentPlays.map((sit) => (
          <button
            key={sit.id}
            className={`m-card ${activeSituation?.id === sit.id ? 'active' : ''}`}
            onClick={() => onSelect(sit)}
          >
            <div className="m-card-title">{sit.title}</div>
          </button>
        ))}
      </div>

      {/* Expandable panel for focus/names */}
      {showPanel && (
        <div className="m-expand-panel">
          {showPanel === 'focus' && focusPanel}
          {showPanel === 'names' && namePanel}
        </div>
      )}
    </div>
  );
}

export default MobileTabs;
