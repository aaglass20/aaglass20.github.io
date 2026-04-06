import { useState } from 'react';
import { DEFAULT_POSITIONS, POSITION_KEYS } from '../data/fieldPositions';
import './SituationPicker.css';

const RUNNER_OPTIONS = [
  { value: '', label: 'Any Runners' },
  { value: 'none', label: 'No Runners' },
  { value: 'runner1', label: 'Runner on 1st' },
  { value: 'runner2', label: 'Runner on 2nd' },
  { value: 'runner3', label: 'Runner on 3rd' },
  { value: 'runner1,runner2', label: '1st & 2nd' },
  { value: 'runner1,runner3', label: '1st & 3rd' },
  { value: 'runner2,runner3', label: '2nd & 3rd' },
  { value: 'runner1,runner2,runner3', label: 'Bases Loaded' },
];

function SituationPicker({ situations, activeSituation, onSelect }) {
  const [hitToFilter, setHitToFilter] = useState('highlighted');
  const [runnerFilter, setRunnerFilter] = useState('');

  // Filter situations
  const filtered = situations.filter((sit) => {
    // Highlighted filter
    if (hitToFilter === 'highlighted') {
      if (!sit.highlighted) return false;
    } else if (hitToFilter && sit.hitTo !== hitToFilter) return false;

    // Runner filter
    if (runnerFilter) {
      if (runnerFilter === 'none') {
        if (sit.runners.length > 0) return false;
      } else {
        const needed = runnerFilter.split(',');
        const has = new Set(sit.runners);
        if (!needed.every((r) => has.has(r)) || sit.runners.length !== needed.length) return false;
      }
    }

    return true;
  });

  // Group by category
  const categories = {};
  for (const sit of filtered) {
    const cat = sit.category || 'Uncategorized';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(sit);
  }

  const categoryNames = Object.keys(categories);
  const [expandedCats, setExpandedCats] = useState(() => new Set(categoryNames));

  const toggleCategory = (cat) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="situation-picker">
      <h3>Situations</h3>

      <div className="filters">
        <div className="filter-row">
          <label>Hit To:</label>
          <select value={hitToFilter} onChange={(e) => setHitToFilter(e.target.value)}>
            <option value="highlighted">Highlighted</option>
            <option value="">All Positions</option>
            {POSITION_KEYS.map((key) => (
              <option key={key} value={key}>{DEFAULT_POSITIONS[key].label} — {DEFAULT_POSITIONS[key].name}</option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <label>Runners:</label>
          <select value={runnerFilter} onChange={(e) => setRunnerFilter(e.target.value)}>
            {RUNNER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="category-list">
        {categoryNames.length === 0 && (
          <div className="no-results">No situations match filters</div>
        )}
        {categoryNames.map((cat) => (
          <div key={cat} className="category-group">
            <button
              className={`category-header ${expandedCats.has(cat) ? 'expanded' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              <span className="category-arrow">{expandedCats.has(cat) ? '▾' : '▸'}</span>
              <span className="category-name">{cat}</span>
              <span className="category-count">{categories[cat].length}</span>
            </button>
            {expandedCats.has(cat) && (
              <div className="situation-list">
                {categories[cat].map((sit) => (
                  <button
                    key={sit.id}
                    className={`situation-card ${activeSituation?.id === sit.id ? 'active' : ''}`}
                    onClick={() => onSelect(sit)}
                  >
                    <div className="situation-title">{sit.title}</div>
                    <div className="situation-desc">{sit.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SituationPicker;
