import './PlayerPanel.css';

export default function PlayerPanel({
  scenario,
  focusedPlayer,
  playerNames,
  onFocusPlayer,
  onNameChange,
  onToggleHighlight,
  gameFormat,
}) {
  const keyframes = scenario?.keyframes || [];
  const activeKf = keyframes[0]; // Use first keyframe to determine available positions

  const homeKeys = Object.keys(activeKf?.home || {});
  const awayKeys = Object.keys(activeKf?.away || {});

  return (
    <div className="pp-container">
      <div className="pp-header">Players</div>
      <div className="pp-teams">
        {/* Home */}
        <div className="pp-team">
          <div className="pp-team-header pp-team-home">Home</div>
          {homeKeys.map((pos) => {
            const isFocused = focusedPlayer?.team === 'home' && focusedPlayer?.pos === pos;
            const name = playerNames?.home?.[pos] || '';
            const highlighted = activeKf?.home?.[pos]?.highlighted || false;
            return (
              <div
                key={pos}
                className={`pp-player ${isFocused ? 'focused' : ''}`}
                onClick={() => onFocusPlayer && onFocusPlayer(isFocused ? null : { team: 'home', pos })}
              >
                <div className="pp-player-badge pp-badge-home">{pos.slice(0, 3)}</div>
                <input
                  type="text"
                  className="pp-name-input"
                  value={name}
                  placeholder="Name"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onNameChange && onNameChange('home', pos, e.target.value)}
                />
                <button
                  className={`pp-highlight-btn ${highlighted ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHighlight && onToggleHighlight('home', pos);
                  }}
                  title="Toggle highlight"
                >
                  *
                </button>
              </div>
            );
          })}
        </div>

        {/* Away */}
        <div className="pp-team">
          <div className="pp-team-header pp-team-away">Away</div>
          {awayKeys.map((pos) => {
            const isFocused = focusedPlayer?.team === 'away' && focusedPlayer?.pos === pos;
            const name = playerNames?.away?.[pos] || '';
            const highlighted = activeKf?.away?.[pos]?.highlighted || false;
            return (
              <div
                key={pos}
                className={`pp-player ${isFocused ? 'focused' : ''}`}
                onClick={() => onFocusPlayer && onFocusPlayer(isFocused ? null : { team: 'away', pos })}
              >
                <div className="pp-player-badge pp-badge-away">{pos.slice(0, 3)}</div>
                <input
                  type="text"
                  className="pp-name-input"
                  value={name}
                  placeholder="Name"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onNameChange && onNameChange('away', pos, e.target.value)}
                />
                <button
                  className={`pp-highlight-btn ${highlighted ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHighlight && onToggleHighlight('away', pos);
                  }}
                  title="Toggle highlight"
                >
                  *
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
