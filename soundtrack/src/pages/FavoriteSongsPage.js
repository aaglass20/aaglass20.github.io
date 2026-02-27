import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as sheetsApi from '../api/sheetsApi';
import DraggableList from '../components/DraggableList';
import SongTile from '../components/SongTile';
import SongSearchModal from '../components/SongSearchModal';

const MAX_SONGS = 25;

const FavoriteSongsPage = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const saveTimer = useRef(null);

  const loadSongs = useCallback(async () => {
    if (!user) return;
    try {
      const data = await sheetsApi.getUserFavoriteSongs(user.userId);
      if (data && data.songs) setSongs(data.songs);
    } catch (e) {
      console.error('Failed to load favorite songs:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadSongs(); }, [loadSongs]);

  const debouncedSave = useCallback((updatedSongs) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      sheetsApi.saveFavoriteSongs(user.userId, updatedSongs);
    }, 2000);
  }, [user]);

  const handleReorder = (reordered) => {
    setSongs(reordered);
    debouncedSave(reordered);
  };

  const handleAdd = (song) => {
    if (songs.length >= MAX_SONGS) return;
    const updated = [...songs, song];
    setSongs(updated);
    debouncedSave(updated);
    setModalOpen(false);
  };

  const handleRemove = (index) => {
    const updated = songs.filter((_, i) => i !== index);
    setSongs(updated);
    debouncedSave(updated);
  };

  return (
    <div className="page favorites-page">
      <div className="page-header">
        <h2>Top 25 Songs</h2>
        <span className="item-count">{songs.length}/{MAX_SONGS}</span>
      </div>
      <p className="page-description">
        Drag to reorder your all-time favorite songs. Changes save automatically.
      </p>

      {loading ? (
        <div className="loading">Loading favorites...</div>
      ) : (
        <>
          <DraggableList
            items={songs}
            onReorder={handleReorder}
            renderItem={(song, index) => (
              <SongTile
                song={song}
                onRemove={() => handleRemove(index)}
                compact
                showEmbed={false}
              />
            )}
          />

          {songs.length < MAX_SONGS && (
            <button className="btn-add-favorite" onClick={() => setModalOpen(true)}>
              + Add Song ({songs.length}/{MAX_SONGS})
            </button>
          )}
        </>
      )}

      <SongSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleAdd}
      />
    </div>
  );
};

export default FavoriteSongsPage;
