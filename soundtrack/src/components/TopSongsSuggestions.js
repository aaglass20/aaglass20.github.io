import React from 'react';
import topSongsByYear from '../data/topSongsByYear.json';

const TopSongsSuggestions = ({ year, onSelect }) => {
  const songs = topSongsByYear[year] || [];
  if (songs.length === 0) return null;

  return (
    <div className="top-suggestions">
      <div className="suggestions-label">Popular in {year}:</div>
      <div className="suggestions-list">
        {songs.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => onSelect({
              songTitle: s.title,
              artist: s.artist,
              spotifyId: '',
              spotifyUrl: '',
            })}
          >
            <span className="chip-title">{s.title}</span>
            <span className="chip-artist">{s.artist}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopSongsSuggestions;
