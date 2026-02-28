import React from 'react';
import SongTile from './SongTile';
import topSongsByYear from '../data/topSongsByYear.json';
import { FEATURES } from '../config';

const YearCard = ({ year, song, onPickSong, onRemoveSong, onBrowseTopSongs, isOwner = true }) => {
  const suggestions = topSongsByYear[year] || [];

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
                title={`Browse top songs of ${year}`}
              >
                &#9835; {year}
              </button>
            )}
            <button className="btn-add-song" onClick={() => onPickSong(year)}>
              + Add Song
            </button>
          </>
        )}
      </div>

      {song ? (
        <SongTile
          song={song}
          onRemove={isOwner ? () => onRemoveSong(year) : undefined}
          compact
        />
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
