import { SCRIPT_URL, SHEETS_CONFIGURED } from '../config';

const get = async (action, params = {}) => {
  if (!SHEETS_CONFIGURED) return null;
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${SCRIPT_URL}?${query}`);
  return res.json();
};

const post = (action, body = {}) => {
  if (!SHEETS_CONFIGURED) return Promise.resolve();
  return fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ action, ...body }),
  });
};

// Users
export const createUser = (name, pinHash, birthYear) =>
  post('createUser', { name, pinHash, birthYear });

export const verifyPin = (name, pinHash) =>
  get('verifyPin', { name, pinHash });

export const getUser = (userId) =>
  get('getUser', { userId });

export const getAllUsers = () =>
  get('getAllUsers');

// Timeline
export const getUserTimeline = (userId) =>
  get('getUserTimeline', { userId });

export const saveTimelineSong = (userId, year, songTitle, artist, spotifyId, spotifyUrl) =>
  post('saveTimelineSong', { userId, year, songTitle, artist, spotifyId, spotifyUrl });

export const deleteTimelineSong = (userId, year) =>
  post('deleteTimelineSong', { userId, year });

// Favorites
export const getUserFavoriteSongs = (userId) =>
  get('getUserFavoriteSongs', { userId });

export const saveFavoriteSongs = (userId, songs) =>
  post('saveFavoriteSongs', { userId, songs });

export const getUserFavoriteAlbums = (userId) =>
  get('getUserFavoriteAlbums', { userId });

export const saveFavoriteAlbums = (userId, albums) =>
  post('saveFavoriteAlbums', { userId, albums });

// Likes
export const getLikes = () =>
  get('getLikes');

export const getUserLikes = (userId) =>
  get('getUserLikes', { userId });

export const likeSong = (likerUserId, targetUserId, songTitle, artist, spotifyId, context) =>
  post('likeSong', { likerUserId, targetUserId, songTitle, artist, spotifyId, context });

export const unlikeSong = (likerUserId, spotifyId) =>
  post('unlikeSong', { likerUserId, spotifyId });

// Super Chart
export const getSuperChart = () =>
  get('getSuperChart');
