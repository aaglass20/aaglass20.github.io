import './ToolsDrawer.css';

const LINE_COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#fbbf24', label: 'Yellow' },
  { value: '#22d3ee', label: 'Cyan' },
  { value: '#f97316', label: 'Orange' },
  { value: '#4ade80', label: 'Green' },
  { value: '#f87171', label: 'Red' },
];

const TOOLS = [
  { id: 'select',       label: 'Select',        icon: 'S',  group: 'base' },
  { id: 'cone',         label: 'Cone',          icon: 'C',  group: 'base' },
];

const LINE_TOOLS = [
  { id: 'arrow',        label: 'Arrow',         icon: '->' },
  { id: 'dashed-arrow', label: 'Dashed Arrow',  icon: '=>' },
  { id: 'line',         label: 'Line',          icon: '--' },
  { id: 'dashed-line',  label: 'Dashed Line',   icon: '- -' },
  { id: 'curve-arrow',  label: 'Curve Arrow',   icon: '~>' },
];

export default function ToolsDrawer({
  isOpen,
  onClose,
  activeTool,
  onToolSelect,
  activeLineColor,
  onLineColorChange,
  linePersistence,
  onLineTypeChange,
  onClearFrameLines,
  onClearAllLines,
}) {
  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      <div className={`drawer drawer-right ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="td-header">
          <span className="td-title">Tools</span>
          <button className="td-close-btn" onClick={onClose}>X</button>
        </div>

        <div className="td-body">
          {/* Base tools */}
          <div className="td-section">
            <div className="td-section-label">Selection</div>
            <div className="td-tool-row">
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  className={`td-tool-btn ${activeTool === t.id ? 'active' : ''}`}
                  onClick={() => onToolSelect(t.id)}
                  title={t.label}
                >
                  <span className="td-tool-icon">{t.icon}</span>
                  <span className="td-tool-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lines & Arrows */}
          <div className="td-section">
            <div className="td-section-label">Lines and Arrows</div>
            <div className="td-tool-grid">
              {LINE_TOOLS.map((t) => (
                <button
                  key={t.id}
                  className={`td-tool-btn ${activeTool === t.id ? 'active' : ''}`}
                  onClick={() => onToolSelect(t.id)}
                  title={t.label}
                >
                  <span className="td-tool-icon">{t.icon}</span>
                  <span className="td-tool-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line Persistence */}
          <div className="td-section">
            <div className="td-section-label">Line Persistence</div>
            <div className="td-toggle-group">
              <button
                className={`td-toggle-btn ${linePersistence === 'frame' ? 'active' : ''}`}
                onClick={() => onLineTypeChange('frame')}
              >
                Frame Only
              </button>
              <button
                className={`td-toggle-btn ${linePersistence === 'scenario' ? 'active' : ''}`}
                onClick={() => onLineTypeChange('scenario')}
              >
                Whole Scenario
              </button>
            </div>
            <p className="td-hint">
              {linePersistence === 'frame'
                ? 'Lines appear only in the active keyframe.'
                : 'Lines appear throughout the entire scenario.'}
            </p>
          </div>

          {/* Color Picker */}
          <div className="td-section">
            <div className="td-section-label">Line Color</div>
            <div className="td-colors">
              {LINE_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`td-color-swatch ${activeLineColor === c.value ? 'active' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => onLineColorChange(c.value)}
                  title={c.label}
                />
              ))}
            </div>
            <div className="td-color-preview" style={{ background: activeLineColor }}>
              Selected: {LINE_COLORS.find((c) => c.value === activeLineColor)?.label || activeLineColor}
            </div>
          </div>

          {/* Clear actions */}
          <div className="td-section">
            <div className="td-section-label">Clear Lines</div>
            <div className="td-action-btns">
              <button className="td-action-btn td-btn-warn" onClick={onClearFrameLines}>
                Clear Frame Lines
              </button>
              <button className="td-action-btn td-btn-danger" onClick={onClearAllLines}>
                Clear All Lines
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
