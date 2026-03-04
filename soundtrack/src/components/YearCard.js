import React, { useState } from 'react';
import SongTile from './SongTile';
import topSongsByYear from '../data/topSongsByYear.json';
import { FEATURES } from '../config';

const YearCard = ({ year, song, onPickSong, onRemoveSong, onBrowseTopSongs, onSaveStory, isOwner = true }) => {
  const suggestions = topSongsByYear[year] || [];
  const [editingStory, setEditingStory] = useState(false);
  const [storyDraft, setStoryDraft] = useState('');
  const [viewingStory, setViewingStory] = useState(false);

  const storyText = song?.story || '';

  const handleEditStory = () => {
    setStoryDraft(storyText);
    setEditingStory(true);
  };

  const handleSaveStory = () => {
    onSaveStory(year, storyDraft);
    setEditingStory(false);
  };

  const handleCancelStory = () => {
    setEditingStory(false);
  };

  return (
    <div className={`year-card ${song ? 'has-song' : ''}`}>
      <div className="year-card-header">
        <span className="year-label">{year}</span>
        {isOwner && !song && (
          <>
            {FEATURES.TOP_SONGS && (
              <button
                className="btn-top-songs"
                onClick={() => onBrowseTopSongs(year)}
                title={`View Top Songs in ${year}`}
              >
                &#9835; View Top Songs in {year}
              </button>
            )}
            <button className="btn-add-song" onClick={() => onPickSong(year)}>
              + Add Song
            </button>
          </>
        )}
      </div>

      {song ? (
        <>
          <SongTile
            song={song}
            onRemove={isOwner ? () => onRemoveSong(year) : undefined}
            compact
          />

          {isOwner && (
            <div className="story-section">
              {editingStory ? (
                <div className="story-edit">
                  <textarea
                    className="story-textarea"
                    value={storyDraft}
                    onChange={(e) => setStoryDraft(e.target.value)}
                    placeholder="Why did you pick this song for this year?"
                    rows={3}
                  />
                  <div className="story-edit-actions">
                    <button className="btn-story-save" onClick={handleSaveStory}>Save</button>
                    <button className="btn-story-cancel" onClick={handleCancelStory}>Cancel</button>
                  </div>
                </div>
              ) : storyText ? (
                <>
                  <p className="story-text">{storyText}</p>
                  <button className="story-toggle" onClick={handleEditStory}>Edit Story</button>
                </>
              ) : (
                <button className="story-toggle" onClick={handleEditStory}>+ Add Story</button>
              )}
            </div>
          )}

          {!isOwner && storyText && (
            <div className="story-section">
              <button className="story-toggle" onClick={() => setViewingStory(!viewingStory)}>
                {viewingStory ? 'Hide Story' : 'View Story'}
              </button>
              {viewingStory && <p className="story-text">{storyText}</p>}
            </div>
          )}
        </>
      ) : isOwner ? (
        <div className="year-suggestions">
          {suggestions.slice(0, 6).map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => onPickSong(year, s)}
              title={`${s.title} - ${s.artist}`}
            >
              {s.title}
            </button>
          ))}
        </div>
      ) : (
        <div className="year-empty">No song picked</div>
      )}
    </div>
  );
};

export default YearCard;
