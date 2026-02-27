import React from 'react';
import SpotifyEmbed from './SpotifyEmbed';

const AlbumTile = ({ album, rank, onRemove, showEmbed = false }) => {
  if (!album) return null;

  return (
    <div className="album-tile">
      <span className="album-rank">#{rank}</span>
      {album.coverUrl && (
        <img src={album.coverUrl} alt="" className="album-cover" />
      )}
      <div className="album-tile-info">
        <div className="album-tile-title">{album.albumTitle || album.name}</div>
        <div className="album-tile-artist">{album.artist}</div>
      </div>
      {onRemove && (
        <button className="btn-remove" onClick={onRemove} title="Remove album">×</button>
      )}
      {showEmbed && album.spotifyId && (
        <SpotifyEmbed spotifyId={album.spotifyId} type="album" compact />
      )}
    </div>
  );
};

export default AlbumTile;
