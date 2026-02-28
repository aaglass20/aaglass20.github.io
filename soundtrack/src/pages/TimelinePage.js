import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as sheetsApi from '../api/sheetsApi';
import YearCard from '../components/YearCard';
import SongSearchModal from '../components/SongSearchModal';
import TopSongsModal from '../components/TopSongsModal';

const TimelinePage = () => {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalYear, setModalYear] = useState(null);
  const [topSongsYear, setTopSongsYear] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = [];
  if (user?.birthYear) {
    for (let y = currentYear; y >= user.birthYear; y--) {
      years.push(y);
    }
  }

  const loadTimeline = useCallback(async () => {
    if (!user) return;
    try {
      const data = await sheetsApi.getUserTimeline(user.userId);
      if (data && data.songs) {
        const map = {};
        data.songs.forEach(s => { map[s.year] = s; });
        setTimeline(map);
      }
    } catch (e) {
      console.error('Failed to load timeline:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadTimeline(); }, [loadTimeline]);

  const handlePickSong = (year, suggestion) => {
    setModalYear(year);
  };

  const handleSelectSong = (song) => {
    if (!modalYear) return;
    const updated = { ...timeline, [modalYear]: { ...song, year: modalYear } };
    setTimeline(updated);
    sheetsApi.saveTimelineSong(
      user.userId, modalYear,
      song.songTitle, song.artist,
      song.spotifyId, song.spotifyUrl
    );
    setModalYear(null);
  };

  const handleSelectTopSong = (song) => {
    if (!topSongsYear) return;
    const updated = { ...timeline, [topSongsYear]: { ...song, year: topSongsYear } };
    setTimeline(updated);
    sheetsApi.saveTimelineSong(
      user.userId, topSongsYear,
      song.songTitle, song.artist,
      song.spotifyId, song.spotifyUrl
    );
    setTopSongsYear(null);
  };

  const handleRemoveSong = (year) => {
    const updated = { ...timeline };
    delete updated[year];
    setTimeline(updated);
    sheetsApi.deleteTimelineSong(user.userId, year);
  };

  const filledCount = Object.keys(timeline).length;
  const totalYears = years.length;
  const pct = totalYears > 0 ? Math.round((filledCount / totalYears) * 100) : 0;

  return (
    <div className="page timeline-page">
      <div className="page-header">
        <h2>My Timeline</h2>
        <div className="timeline-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-text">{filledCount}/{totalYears} years ({pct}%)</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading your timeline...</div>
      ) : years.length === 0 ? (
        <div className="empty-state">
          <p>Set your birth year in your profile to start building your timeline.</p>
        </div>
      ) : (
        <div className="year-grid">
          {years.map(year => (
            <YearCard
              key={year}
              year={year}
              song={timeline[year]}
              onPickSong={handlePickSong}
              onRemoveSong={handleRemoveSong}
              onBrowseTopSongs={setTopSongsYear}
            />
          ))}
        </div>
      )}

      <SongSearchModal
        isOpen={modalYear !== null}
        onClose={() => setModalYear(null)}
        onSelect={handleSelectSong}
        year={modalYear}
      />

      <TopSongsModal
        isOpen={topSongsYear !== null}
        onClose={() => setTopSongsYear(null)}
        onSelect={handleSelectTopSong}
        year={topSongsYear}
      />
    </div>
  );
};

export default TimelinePage;
