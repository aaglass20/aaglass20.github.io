import React, { useState, useEffect } from 'react';
import { getTopSongsForYear } from '../api/spotifyApi';
import './Modal.css';

const TopSongsModal = ({ isOpen, onClose, onSelect, year }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !year) return;
    setLoading(true);
    setError('');
    setTracks([]);
    getTopSongsForYear(year)
      .then(data => {
        setTracks(data.tracks || []);
        setPlaylistName(data.playlistName || `Top Songs in ${year}`);
        if (data.error && (!data.tracks || data.tracks.length === 0)) {
          setError(data.error);
        }
      })
      .catch(e => {
        console.error('Failed to load top songs:', e);
        setError('Failed to load top songs.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, year]);

  const handleSelect = (track) => {
    onSelect({
      songTitle: track.name,
      artist: track.artist,
      spotifyId: track.id,
      spotifyUrl: track.spotifyUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {playlistName || `Top Songs in ${year}`}
            {tracks.length > 0 && (
              <span className="top-songs-count">{tracks.length} songs</span>
            )}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="no-results">Loading top songs...</div>
        ) : error ? (
          <div className="no-results">{error}</div>
        ) : (
          <div className="search-results top-songs-list">
            {tracks.map((t, i) => (
              <button key={t.id || i} className="search-result" onClick={() => handleSelect(t)}>
                <span className="top-songs-rank">{i + 1}</span>
                {t.coverUrl && <img src={t.coverUrl} alt="" className="result-cover" />}
                <div className="result-info">
                  <div className="result-name">{t.name}</div>
                  <div className="result-artist">{t.artist}</div>
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
