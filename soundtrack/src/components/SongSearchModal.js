import React, { useState, useCallback } from 'react';
import { searchTracks } from '../api/spotifyApi';
import './Modal.css';

const SongSearchModal = ({ isOpen, onClose, onSelect, year }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await searchTracks(query);
      setResults(res);
    } catch (e) {
      console.error('Search failed:', e);
    }
    setSearching(false);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelect = (result) => {
    onSelect({
      songTitle: result.name,
      artist: result.artist,
      spotifyId: result.id,
      spotifyUrl: result.spotifyUrl,
    });
    resetAndClose();
  };

  const handleManualSubmit = () => {
    if (!manualTitle.trim() || !manualArtist.trim()) return;
    onSelect({
      songTitle: manualTitle.trim(),
      artist: manualArtist.trim(),
      spotifyId: '',
      spotifyUrl: '',
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setQuery('');
    setResults([]);
    setManualMode(false);
    setManualTitle('');
    setManualArtist('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{year ? `Pick a song for ${year}` : 'Search for a song'}</h3>
          <button className="modal-close" onClick={resetAndClose}>×</button>
        </div>

        {!manualMode ? (
          <>
            <div className="search-bar">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search songs on Spotify..."
                autoFocus
              />
              <button className="btn-search" onClick={handleSearch} disabled={searching}>
                {searching ? '...' : 'Search'}
              </button>
            </div>

            <div className="search-results">
              {results.map(r => (
                <button key={r.id} className="search-result" onClick={() => handleSelect(r)}>
                  {r.coverUrl && <img src={r.coverUrl} alt="" className="result-cover" />}
                  <div className="result-info">
                    <div className="result-name">{r.name}</div>
                    <div className="result-artist">{r.artist}</div>
                  </div>
                </button>
              ))}
              {results.length === 0 && query && !searching && (
                <p className="no-results">No results found. Try different terms or enter manually.</p>
              )}
            </div>

            <button className="btn-manual-toggle" onClick={() => setManualMode(true)}>
              Or enter manually
            </button>
          </>
        ) : (
          <div className="manual-entry">
            <input
              type="text"
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              placeholder="Song title"
              autoFocus
            />
            <input
              type="text"
              value={manualArtist}
              onChange={e => setManualArtist(e.target.value)}
              placeholder="Artist"
            />
            <div className="manual-actions">
              <button className="btn-primary" onClick={handleManualSubmit}>Add Song</button>
              <button className="btn-secondary" onClick={() => setManualMode(false)}>Back to search</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongSearchModal;
