import React, { useState } from 'react';
import { getEmbedUrl } from '../api/spotifyApi';

const SpotifyEmbed = ({ spotifyId, type = 'track', compact = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [show, setShow] = useState(false);

  if (!spotifyId || spotifyId.startsWith('mock')) return null;

  if (!show) {
    return (
      <button
        className="btn-play-preview"
        onClick={() => setShow(true)}
        title="Play preview"
      >
        ▶ Preview
      </button>
    );
  }

  const height = compact ? 80 : 152;

  return (
    <div className="spotify-embed" style={{ minHeight: height }}>
      {!loaded && <div className="embed-loading">Loading player...</div>}
      <iframe
        src={getEmbedUrl(spotifyId, type)}
        width="100%"
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify player"
        onLoad={() => setLoaded(true)}
        style={{ borderRadius: 12, opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
};

export default SpotifyEmbed;
