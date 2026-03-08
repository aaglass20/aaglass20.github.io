import React from 'react';
import topSongsByYear from '../data/topSongsByYear.json';
import './Modal.css';

const TopSongsModal = ({ isOpen, onClose, onSelect, year }) => {
  if (!isOpen) return null;

  const songs = topSongsByYear[year] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            Top Songs of {year}
            {songs.length > 0 && (
              <span className="top-songs-count">{songs.length} songs</span>
            )}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {songs.length === 0 ? (
          <div className="no-results">No top songs data for {year}.</div>
        ) : (
          <div className="search-results top-songs-list">
            {songs.map((s, i) => (
              <button
                key={i}
                className="search-result"
                onClick={() => onSelect(s, year)}
              >
                <span className="top-songs-rank">{i + 1}</span>
                <div className="result-info">
                  <div className="result-name">{s.title}</div>
                  <div className="result-artist">{s.artist}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopSongsModal;
