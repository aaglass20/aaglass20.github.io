import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as sheetsApi from '../api/sheetsApi';
import SongTile from '../components/SongTile';
import AlbumTile from '../components/AlbumTile';
import FollowButton from '../components/FollowButton';

const ViewSoundtrackPage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [favSongs, setFavSongs] = useState([]);
  const [favAlbums, setFavAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('timeline');
  const [expandedStories, setExpandedStories] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [userData, timelineData, songsData, albumsData] = await Promise.all([
          sheetsApi.getUser(userId),
          sheetsApi.getUserTimeline(userId),
          sheetsApi.getUserFavoriteSongs(userId),
          sheetsApi.getUserFavoriteAlbums(userId),
        ]);
        if (userData) setProfile(userData);
        if (timelineData?.songs) setTimeline(timelineData.songs);
        if (songsData?.songs) setFavSongs(songsData.songs);
        if (albumsData?.albums) setFavAlbums(albumsData.albums);
      } catch (e) {
        console.error('Failed to load soundtrack:', e);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return <div className="page"><div className="loading">Loading soundtrack...</div></div>;
  if (!profile) return (
    <div className="page">
      <div className="empty-state">
        User not found. <Link to="/browse">Browse all users</Link>
      </div>
    </div>
  );

  const playableSongs = timeline
    .filter(s => s.spotifyId)
    .sort((a, b) => a.year - b.year);

  const tabs = [
    { id: 'timeline', label: `Timeline (${timeline.length})` },
    { id: 'songs', label: `Top Songs (${favSongs.length})` },
    { id: 'albums', label: `Top Albums (${favAlbums.length})` },
    ...(playableSongs.length > 0 ? [{ id: 'playlist', label: `♫ Play All (${playableSongs.length})` }] : []),
  ];

  return (
    <div className="page view-page">
      <div className="view-header">
        <div className="view-avatar">{profile.name?.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <h2>{profile.name}'s Soundtrack</h2>
          <p className="view-meta">
            Born {profile.birthYear} · {timeline.length} songs on timeline
          </p>
        </div>
        <FollowButton targetUserId={userId} />
      </div>

      <div className="view-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`view-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'timeline' && (
        <div className="view-timeline">
          {timeline.length === 0 ? (
            <div className="empty-state">No songs on timeline yet.</div>
          ) : (
            timeline.sort((a, b) => b.year - a.year).map(song => (
              <div key={song.year} className="view-year-row-wrapper">
                <div className="view-year-row">
                  <span className="view-year-label">{song.year}</span>
                  <SongTile
                    song={song}
                    showLike
                    likeContext="timeline"
                    viewingUserId={userId}
                    compact
                  />
                </div>
                {song.story && (
                  <div className="story-section">
                    <button
                      className="story-toggle"
                      onClick={() => setExpandedStories(prev => ({ ...prev, [song.year]: !prev[song.year] }))}
                    >
                      {expandedStories[song.year] ? 'Hide Story' : 'View Story'}
                    </button>
                    {expandedStories[song.year] && <p className="story-text">{song.story}</p>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'songs' && (
        <div className="view-favorites">
          {favSongs.length === 0 ? (
            <div className="empty-state">No favorite songs yet.</div>
          ) : (
            favSongs.map((song, i) => (
              <div key={i} className="view-fav-row">
                <span className="view-rank">#{i + 1}</span>
                <SongTile
                  song={song}
                  showLike
                  likeContext="favorites"
                  viewingUserId={userId}
                  compact
                />
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'albums' && (
        <div className="view-favorites">
          {favAlbums.length === 0 ? (
            <div className="empty-state">No favorite albums yet.</div>
          ) : (
            favAlbums.map((album, i) => (
              <AlbumTile key={i} album={album} rank={i + 1} />
            ))
          )}
        </div>
      )}

      {tab === 'playlist' && (
        <div className="view-playlist">
          <p className="playlist-info">
            {playableSongs.length} songs · {profile.name}'s life soundtrack
          </p>
          <div className="playlist-tracks">
            {playableSongs.map(song => (
              <div key={song.spotifyId} className="playlist-track">
                <span className="playlist-year">{song.year}</span>
                <iframe
                  src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`${song.songTitle} - ${song.artist}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSoundtrackPage;
