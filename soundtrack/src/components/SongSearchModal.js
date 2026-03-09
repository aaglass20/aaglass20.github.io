import React, { useState, useCallback, useEffect, useRef } from 'react';
import { searchTracks } from '../api/spotifyApi';
import './Modal.css';

const SongSearchModal = ({ isOpen, onClose, onSelect, year, initialQuery = '', onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const lastInitialQuery = useRef('');

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    setPreviewId(null);
    try {
      const res = await searchTracks(q);
      setResults(res);
    } catch (e) {
      console.error('Search failed:', e);
    }
    setSearching(false);
  }, []);

  // Auto-search when opened with an initialQuery
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery !== lastInitialQuery.current) {
      lastInitialQuery.current = initialQuery;
      setQuery(initialQuery);
      doSearch(initialQuery);
    }
    if (!isOpen) {
      lastInitialQuery.current = '';
    }
  }, [isOpen, initialQuery, doSearch]);

  const handleSearch = useCallback(() => {
    doSearch(query);
  }, [query, doSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const togglePreview = (e, id) => {
    e.stopPropagation();
    setPreviewId(prev => prev === id ? null : id);
  };

  const handleSelect = (result) => {
    setPreviewId(null);
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
    setPreviewId(null);
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
          {onBack && (
            <button className="modal-back" onClick={() => { resetAndClose(); onBack(); }}>&#8592;</button>
          )}
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
              {searching ? (
                <div className="search-loading">
                  <div className="search-spinner" />
                  <span>Searching Spotify...</span>
                </div>
              ) : (
                <>
                  {results.map(r => (
                    <div key={r.id} className="search-result-wrapper">
                      <button className="search-result" onClick={() => handleSelect(r)}>
                        {r.coverUrl && <img src={r.coverUrl} alt="" className="result-cover" />}
                        <div className="result-info">
                          <div className="result-name">{r.name}</div>
                          <div className="result-artist">{r.artist}</div>
                        </div>
                        <span
                          className={`preview-btn ${previewId === r.id ? 'playing' : ''}`}
                          onClick={(e) => togglePreview(e, r.id)}
                          title={previewId === r.id ? 'Hide preview' : 'Preview'}
                        >
                          {previewId === r.id ? '\u25A0' : '\u25B6'}
                        </span>
                      </button>
                      {previewId === r.id && (
                        <div className="preview-embed">
                          <iframe
                            src={`https://open.spotify.com/embed/track/${r.id}?utm_source=generator&theme=0`}
                            width="100%"
                            height="80"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title={`Preview ${r.name}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {results.length === 0 && query && (
                    <p className="no-results">No results found. Try different terms or enter manually.</p>
                  )}
                </>
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
