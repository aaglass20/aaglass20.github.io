import React from 'react';
import SpotifyEmbed from './SpotifyEmbed';
import LikeButton from './LikeButton';

const SongTile = ({ song, onRemove, showEmbed = true, showLike = false, likeContext, viewingUserId, compact = false }) => {
  if (!song) return null;

  return (
    <div className="song-tile">
      <div className="song-tile-info">
        <div className="song-tile-title">{song.songTitle || song.name}</div>
        <div className="song-tile-artist">{song.artist}</div>
      </div>
      <div className="song-tile-actions">
        {showLike && song.spotifyId && (
          <LikeButton
            song={song}
            targetUserId={viewingUserId}
            context={likeContext}
          />
        )}
        {onRemove && (
          <button className="btn-remove" onClick={onRemove} title="Remove song">
            ×
          </button>
        )}
      </div>
      {showEmbed && song.spotifyId && (
        <SpotifyEmbed spotifyId={song.spotifyId} compact={compact} />
      )}
    </div>
  );
};

export default SongTile;
