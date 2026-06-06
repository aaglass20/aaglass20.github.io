import { useState, useEffect } from 'react';
import { GAME_FORMATS, FORMATION_OPTIONS } from '../data/formations';
import './FormationSelector.css';

export default function FormationSelector({
  isOpen,
  onClose,
  gameFormat,
  formation,
  onApply,
}) {
  const [selectedFormat, setSelectedFormat] = useState(gameFormat || '11v11');
  const [selectedFormation, setSelectedFormation] = useState(formation || '4-3-3');

  // Keep in sync with parent
  useEffect(() => {
    if (gameFormat) setSelectedFormat(gameFormat);
    if (formation) setSelectedFormation(formation);
  }, [gameFormat, formation, isOpen]);

  // When format changes, default to first formation in that format
  const handleFormatChange = (fmt) => {
    setSelectedFormat(fmt);
    const options = FORMATION_OPTIONS[fmt] || [];
    if (!options.includes(selectedFormation)) {
      setSelectedFormation(options[0] || '');
    }
  };

  const handleApply = () => {
    if (!window.confirm('Apply this formation? This will reset all player positions in all keyframes.')) return;
    onApply(selectedFormat, selectedFormation);
    onClose();
  };

  if (!isOpen) return null;

  const formationOptions = FORMATION_OPTIONS[selectedFormat] || [];

  return (
    <div className="fs-overlay" onClick={onClose}>
      <div className="fs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fs-header">
          <span className="fs-title">Formation Selector</span>
          <button className="fs-close-btn" onClick={onClose}>X</button>
        </div>

        {/* Game format */}
        <div className="fs-section">
          <div className="fs-section-label">Game Format</div>
          <div className="fs-btn-row">
            {GAME_FORMATS.map((fmt) => (
              <button
                key={fmt}
                className={`fs-btn ${selectedFormat === fmt ? 'active' : ''}`}
                onClick={() => handleFormatChange(fmt)}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Formation */}
        <div className="fs-section">
          <div className="fs-section-label">Formation</div>
          <div className="fs-btn-row fs-formation-row">
            {formationOptions.map((f) => (
              <button
                key={f}
                className={`fs-btn fs-btn-formation ${selectedFormation === f ? 'active' : ''}`}
                onClick={() => setSelectedFormation(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="fs-warning">
          Applying will reset ALL player positions in ALL keyframes to formation defaults.
        </div>

        {/* Actions */}
        <div className="fs-actions">
          <button className="fs-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="fs-btn-apply" onClick={handleApply}>Apply Formation</button>
        </div>
      </div>
    </div>
  );
}
