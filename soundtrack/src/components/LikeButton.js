import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as sheetsApi from '../api/sheetsApi';

const LikeButton = ({ song, targetUserId, context = '' }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (!user || user.userId === targetUserId) return null;

  const handleClick = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    if (liked) {
      setLiked(false);
      sheetsApi.unlikeSong(user.userId, song.spotifyId || `${song.songTitle}-${song.artist}`);
    } else {
      setLiked(true);
      sheetsApi.likeSong(
        user.userId,
        targetUserId,
        song.songTitle || song.name,
        song.artist,
        song.spotifyId || '',
        context
      );
    }
  };

  return (
    <button
      className={`like-btn ${liked ? 'liked' : ''} ${animating ? 'like-pop' : ''}`}
      onClick={handleClick}
      title={liked ? 'Unlike' : 'Like'}
    >
      {liked ? '❤️' : '🤍'}
    </button>
  );
};

export default LikeButton;
