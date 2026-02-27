import React, { useState, useEffect } from 'react';
import * as sheetsApi from '../api/sheetsApi';
import SpotifyEmbed from '../components/SpotifyEmbed';

const SuperChartPage = () => {
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await sheetsApi.getSuperChart();
        if (data && data.chart) setChart(data.chart);
      } catch (e) {
        console.error('Failed to load super chart:', e);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page superchart-page">
      <div className="page-header">
        <h2>Super Chart</h2>
        <p className="page-description">
          The most liked songs across all soundtracks
        </p>
      </div>

      {loading ? (
        <div className="loading">Loading chart...</div>
      ) : chart.length === 0 ? (
        <div className="empty-state">
          No likes yet. Browse other soundtracks and start liking songs!
        </div>
      ) : (
        <div className="chart-list">
          {chart.map((entry, i) => (
            <div key={entry.spotifyId || i} className="chart-entry">
              <span className={`chart-rank ${i < 3 ? 'top-three' : ''}`}>
                {i + 1}
              </span>
              <div className="chart-info">
                <div className="chart-song">{entry.songTitle}</div>
                <div className="chart-artist">{entry.artist}</div>
                <div className="chart-likes">
                  ❤️ {entry.likeCount} {entry.likeCount === 1 ? 'like' : 'likes'}
                </div>
              </div>
              {entry.spotifyId && (
                <SpotifyEmbed spotifyId={entry.spotifyId} compact />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperChartPage;
