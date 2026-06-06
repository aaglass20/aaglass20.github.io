import { useState } from 'react';
import './ScenarioDrawer.css';

const CATEGORIES = ['All', 'Build-Up Play', 'Pressing', 'Attacking', 'Defending', 'Set Pieces', 'Other'];

export default function ScenarioDrawer({
  isOpen,
  onClose,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onNewScenario,
  onDeleteScenario,
  onSaveScenario,
  loading,
  isOffline,
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = scenarios.filter((s) => {
    if (activeCategory === 'All') return true;
    return s.category === activeCategory;
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      <div className={`drawer drawer-left ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sd-header">
          <div className="sd-title">
            <span className="sd-title-text">Soccer Scenarios</span>
            {isOffline && <span className="sd-offline-badge">Offline</span>}
          </div>
          <div className="sd-header-actions">
            <button className="sd-btn sd-btn-primary" onClick={onNewScenario} disabled={loading}>
              New
            </button>
            <button className="sd-btn sd-btn-save" onClick={onSaveScenario} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button className="sd-btn sd-btn-icon" onClick={onClose} title="Close">
              X
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="sd-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`sd-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scenario list */}
        <div className="sd-list">
          {filtered.length === 0 && (
            <div className="sd-empty">No scenarios in this category.</div>
          )}
          {filtered.map((scenario) => (
            <div
              key={scenario.id}
              className={`sd-item ${scenario.id === activeScenarioId ? 'active' : ''}`}
              onClick={() => {
                onSelectScenario(scenario.id);
                onClose();
              }}
              onMouseEnter={() => setHoveredId(scenario.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="sd-item-top">
                <span className="sd-item-title">{scenario.title}</span>
                {hoveredId === scenario.id && scenario.id !== activeScenarioId && (
                  <button
                    className="sd-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${scenario.title}"?`)) {
                        onDeleteScenario(scenario.id);
                      }
                    }}
                    title="Delete"
                  >
                    Del
                  </button>
                )}
              </div>
              <div className="sd-item-meta">
                <span className="sd-badge sd-badge-format">{scenario.gameFormat || '11v11'}</span>
                <span className="sd-badge sd-badge-formation">{scenario.formation}</span>
                {scenario.category && (
                  <span className="sd-badge sd-badge-category">{scenario.category}</span>
                )}
              </div>
              {scenario.description && (
                <div className="sd-item-desc">{scenario.description}</div>
              )}
              <div className="sd-item-kf-count">
                {(scenario.keyframes || []).length} keyframe{(scenario.keyframes || []).length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sd-footer">
          {isOffline ? (
            <span className="sd-footer-status offline">Offline Mode - saving to browser</span>
          ) : (
            <span className="sd-footer-status online">Connected to Supabase</span>
          )}
        </div>
      </div>
    </>
  );
}
