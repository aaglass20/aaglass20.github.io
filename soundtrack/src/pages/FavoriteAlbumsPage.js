import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as sheetsApi from '../api/sheetsApi';
import DraggableList from '../components/DraggableList';
import AlbumTile from '../components/AlbumTile';
import AlbumSearchModal from '../components/AlbumSearchModal';

const MAX_ALBUMS = 10;

const FavoriteAlbumsPage = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const saveTimer = useRef(null);

  const loadAlbums = useCallback(async () => {
    if (!user) return;
    try {
      const data = await sheetsApi.getUserFavoriteAlbums(user.userId);
      if (data && data.albums) setAlbums(data.albums);
    } catch (e) {
      console.error('Failed to load favorite albums:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAlbums(); }, [loadAlbums]);

  const debouncedSave = useCallback((updatedAlbums) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      sheetsApi.saveFavoriteAlbums(user.userId, updatedAlbums);
    }, 2000);
  }, [user]);

  const handleReorder = (reordered) => {
    setAlbums(reordered);
    debouncedSave(reordered);
  };

  const handleAdd = (album) => {
    if (albums.length >= MAX_ALBUMS) return;
    const updated = [...albums, album];
    setAlbums(updated);
    debouncedSave(updated);
    setModalOpen(false);
  };

  const handleRemove = (index) => {
    const updated = albums.filter((_, i) => i !== index);
    setAlbums(updated);
    debouncedSave(updated);
  };

  return (
    <div className="page favorites-page">
      <div className="page-header">
        <h2>Top 10 Albums</h2>
        <span className="item-count">{albums.length}/{MAX_ALBUMS}</span>
      </div>
      <p className="page-description">
        Drag to reorder your all-time favorite albums. Changes save automatically.
      </p>

      {loading ? (
        <div className="loading">Loading favorites...</div>
      ) : (
        <>
          <DraggableList
            items={albums}
            onReorder={handleReorder}
            renderItem={(album, index) => (
              <AlbumTile
                album={album}
                rank={index + 1}
                onRemove={() => handleRemove(index)}
              />
            )}
          />

          {albums.length < MAX_ALBUMS && (
            <button className="btn-add-favorite" onClick={() => setModalOpen(true)}>
              + Add Album ({albums.length}/{MAX_ALBUMS})
            </button>
          )}
        </>
      )}

      <AlbumSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleAdd}
      />
    </div>
  );
};

export default FavoriteAlbumsPage;
