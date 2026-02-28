import { SCRIPT_URL, SHEETS_CONFIGURED } from '../config';

export const searchTracks = async (query) => {
  if (!SHEETS_CONFIGURED) return getMockResults(query, 'track');
  const params = new URLSearchParams({ action: 'spotifySearch', q: query, type: 'track' });
  const res = await fetch(`${SCRIPT_URL}?${params}`);
  const data = await res.json();
  return data.results || [];
};

export const searchAlbums = async (query) => {
  if (!SHEETS_CONFIGURED) return getMockResults(query, 'album');
  const params = new URLSearchParams({ action: 'spotifySearch', q: query, type: 'album' });
  const res = await fetch(`${SCRIPT_URL}?${params}`);
  const data = await res.json();
  return data.results || [];
};

export const getTopSongsForYear = async (year) => {
  if (!SHEETS_CONFIGURED) return { tracks: getMockResults(`Top songs of ${year}`, 'track'), playlistName: `Top Songs of ${year}` };
  const params = new URLSearchParams({ action: 'getTopSongsForYear', year });
  const res = await fetch(`${SCRIPT_URL}?${params}`);
  const data = await res.json();
  return data;
};

export const getEmbedUrl = (spotifyId, type = 'track') =>
  `https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator&theme=0`;

// Mock results for offline dev
const getMockResults = (query, type) => {
  const q = query.toLowerCase();
  return [
    {
      id: `mock-${type}-1`,
      name: `${query} - Result 1`,
      artist: 'Mock Artist',
      album: 'Mock Album',
      coverUrl: '',
      spotifyUrl: `https://open.spotify.com/${type}/mock1`,
    },
    {
      id: `mock-${type}-2`,
      name: `${query} - Result 2`,
      artist: 'Another Artist',
      album: 'Another Album',
      coverUrl: '',
      spotifyUrl: `https://open.spotify.com/${type}/mock2`,
    },
  ];
};
