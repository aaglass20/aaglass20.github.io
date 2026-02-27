/**
 * Soundtrack of My Life - Google Apps Script Backend
 *
 * Google Sheet Tabs Required:
 *   Users:          userId | name | pinHash | birthYear | createdAt
 *   TimelineSongs:  userId | year | songTitle | artist | spotifyId | spotifyUrl
 *   FavoriteSongs:  userId | rank | songTitle | artist | spotifyId | spotifyUrl
 *   FavoriteAlbums: userId | rank | albumTitle | artist | spotifyId | spotifyUrl | coverUrl
 *   Likes:          likerUserId | targetUserId | songTitle | artist | spotifyId | context | likedAt
 *
 * Script Properties (File > Project properties > Script properties):
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 */

// ---------- Helpers ----------

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowsToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var results = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    results.push(obj);
  }
  return results;
}

// ---------- Spotify Token ----------

var _spotifyToken = null;

function getSpotifyToken() {
  if (_spotifyToken) return _spotifyToken;
  var props = PropertiesService.getScriptProperties();
  var clientId = props.getProperty('SPOTIFY_CLIENT_ID');
  var clientSecret = props.getProperty('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) return null;

  var response = UrlFetchApp.fetch('https://accounts.spotify.com/api/token', {
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(clientId + ':' + clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: 'grant_type=client_credentials'
  });
  var json = JSON.parse(response.getContentText());
  _spotifyToken = json.access_token;
  return _spotifyToken;
}

// ---------- GET Handler ----------

function doGet(e) {
  var action = e.parameter.action;

  try {
    switch (action) {
      case 'getUser':
        return handleGetUser(e.parameter);
      case 'verifyPin':
        return handleVerifyPin(e.parameter);
      case 'getAllUsers':
        return handleGetAllUsers();
      case 'getUserTimeline':
        return handleGetUserTimeline(e.parameter);
      case 'getUserFavoriteSongs':
        return handleGetUserFavoriteSongs(e.parameter);
      case 'getUserFavoriteAlbums':
        return handleGetUserFavoriteAlbums(e.parameter);
      case 'getLikes':
        return handleGetLikes();
      case 'getUserLikes':
        return handleGetUserLikes(e.parameter);
      case 'getSuperChart':
        return handleGetSuperChart();
      case 'spotifySearch':
        return handleSpotifySearch(e.parameter);
      default:
        return jsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ---------- POST Handler ----------

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;

  try {
    switch (action) {
      case 'createUser':
        return handleCreateUser(data);
      case 'saveTimelineSong':
        return handleSaveTimelineSong(data);
      case 'deleteTimelineSong':
        return handleDeleteTimelineSong(data);
      case 'saveFavoriteSongs':
        return handleSaveFavoriteSongs(data);
      case 'saveFavoriteAlbums':
        return handleSaveFavoriteAlbums(data);
      case 'likeSong':
        return handleLikeSong(data);
      case 'unlikeSong':
        return handleUnlikeSong(data);
      default:
        return jsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ---------- User Handlers ----------

function handleCreateUser(data) {
  var sheet = getSheet('Users');
  var userId = data.name.toLowerCase().replace(/\s+/g, '_');
  sheet.appendRow([userId, data.name, data.pinHash, data.birthYear, new Date().toISOString()]);
  return jsonResponse({ success: true, userId: userId });
}

function handleGetUser(params) {
  var sheet = getSheet('Users');
  var rows = rowsToObjects(sheet);
  var user = rows.find(function(r) { return r.userId === params.userId; });
  if (!user) return jsonResponse({ error: 'User not found' });
  return jsonResponse({ userId: user.userId, name: user.name, birthYear: user.birthYear });
}

function handleVerifyPin(params) {
  var sheet = getSheet('Users');
  var rows = rowsToObjects(sheet);
  var user = rows.find(function(r) {
    return r.name.toLowerCase() === params.name.toLowerCase() && r.pinHash === params.pinHash;
  });
  if (!user) return jsonResponse({ success: false, error: 'Invalid name or PIN' });
  return jsonResponse({ success: true, userId: user.userId, name: user.name, birthYear: user.birthYear });
}

function handleGetAllUsers() {
  var usersSheet = getSheet('Users');
  var timelineSheet = getSheet('TimelineSongs');
  var users = rowsToObjects(usersSheet);
  var timeline = rowsToObjects(timelineSheet);

  // Count songs per user
  var songCounts = {};
  timeline.forEach(function(row) {
    songCounts[row.userId] = (songCounts[row.userId] || 0) + 1;
  });

  var result = users.map(function(u) {
    return {
      userId: u.userId,
      name: u.name,
      birthYear: u.birthYear,
      songCount: songCounts[u.userId] || 0
    };
  });

  return jsonResponse({ users: result });
}

// ---------- Timeline Handlers ----------

function handleGetUserTimeline(params) {
  var sheet = getSheet('TimelineSongs');
  var rows = rowsToObjects(sheet);
  var songs = rows.filter(function(r) { return r.userId === params.userId; });
  return jsonResponse({ songs: songs });
}

function handleSaveTimelineSong(data) {
  var sheet = getSheet('TimelineSongs');
  var allData = sheet.getDataRange().getValues();

  // Find existing row for this user+year
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.userId && String(allData[i][1]) === String(data.year)) {
      // Update existing row
      sheet.getRange(i + 1, 3).setValue(data.songTitle);
      sheet.getRange(i + 1, 4).setValue(data.artist);
      sheet.getRange(i + 1, 5).setValue(data.spotifyId);
      sheet.getRange(i + 1, 6).setValue(data.spotifyUrl);
      return jsonResponse({ success: true });
    }
  }

  // Append new row
  sheet.appendRow([data.userId, data.year, data.songTitle, data.artist, data.spotifyId, data.spotifyUrl]);
  return jsonResponse({ success: true });
}

function handleDeleteTimelineSong(data) {
  var sheet = getSheet('TimelineSongs');
  var allData = sheet.getDataRange().getValues();

  for (var i = allData.length - 1; i >= 1; i--) {
    if (allData[i][0] === data.userId && String(allData[i][1]) === String(data.year)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: true });
}

// ---------- Favorites Handlers ----------

function handleGetUserFavoriteSongs(params) {
  var sheet = getSheet('FavoriteSongs');
  var rows = rowsToObjects(sheet);
  var songs = rows.filter(function(r) { return r.userId === params.userId; });
  songs.sort(function(a, b) { return a.rank - b.rank; });
  return jsonResponse({ songs: songs });
}

function handleSaveFavoriteSongs(data) {
  var sheet = getSheet('FavoriteSongs');
  var allData = sheet.getDataRange().getValues();

  // Delete existing rows for this user (bottom up)
  for (var i = allData.length - 1; i >= 1; i--) {
    if (allData[i][0] === data.userId) {
      sheet.deleteRow(i + 1);
    }
  }

  // Append new rows
  data.songs.forEach(function(song, idx) {
    sheet.appendRow([
      data.userId, idx + 1,
      song.songTitle, song.artist,
      song.spotifyId || '', song.spotifyUrl || ''
    ]);
  });

  return jsonResponse({ success: true });
}

function handleGetUserFavoriteAlbums(params) {
  var sheet = getSheet('FavoriteAlbums');
  var rows = rowsToObjects(sheet);
  var albums = rows.filter(function(r) { return r.userId === params.userId; });
  albums.sort(function(a, b) { return a.rank - b.rank; });
  return jsonResponse({ albums: albums });
}

function handleSaveFavoriteAlbums(data) {
  var sheet = getSheet('FavoriteAlbums');
  var allData = sheet.getDataRange().getValues();

  // Delete existing rows for this user (bottom up)
  for (var i = allData.length - 1; i >= 1; i--) {
    if (allData[i][0] === data.userId) {
      sheet.deleteRow(i + 1);
    }
  }

  // Append new rows
  data.albums.forEach(function(album, idx) {
    sheet.appendRow([
      data.userId, idx + 1,
      album.albumTitle, album.artist,
      album.spotifyId || '', album.spotifyUrl || '',
      album.coverUrl || ''
    ]);
  });

  return jsonResponse({ success: true });
}

// ---------- Likes Handlers ----------

function handleGetLikes() {
  var sheet = getSheet('Likes');
  var rows = rowsToObjects(sheet);
  return jsonResponse({ likes: rows });
}

function handleGetUserLikes(params) {
  var sheet = getSheet('Likes');
  var rows = rowsToObjects(sheet);
  var likes = rows.filter(function(r) { return r.likerUserId === params.userId; });
  return jsonResponse({ likes: likes });
}

function handleLikeSong(data) {
  var sheet = getSheet('Likes');
  sheet.appendRow([
    data.likerUserId, data.targetUserId,
    data.songTitle, data.artist,
    data.spotifyId || '', data.context || '',
    new Date().toISOString()
  ]);
  return jsonResponse({ success: true });
}

function handleUnlikeSong(data) {
  var sheet = getSheet('Likes');
  var allData = sheet.getDataRange().getValues();

  for (var i = allData.length - 1; i >= 1; i--) {
    if (allData[i][0] === data.likerUserId && allData[i][4] === data.spotifyId) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: true });
}

// ---------- Super Chart ----------

function handleGetSuperChart() {
  var sheet = getSheet('Likes');
  var rows = rowsToObjects(sheet);

  // Group by song (using spotifyId or title+artist as key)
  var counts = {};
  rows.forEach(function(row) {
    var key = row.spotifyId || (row.songTitle + '|||' + row.artist);
    if (!counts[key]) {
      counts[key] = {
        songTitle: row.songTitle,
        artist: row.artist,
        spotifyId: row.spotifyId,
        likeCount: 0
      };
    }
    counts[key].likeCount++;
  });

  // Sort by likes descending
  var chart = Object.values(counts);
  chart.sort(function(a, b) { return b.likeCount - a.likeCount; });

  return jsonResponse({ chart: chart.slice(0, 100) });
}

// ---------- Spotify Search ----------

function handleSpotifySearch(params) {
  var token = getSpotifyToken();
  if (!token) return jsonResponse({ error: 'Spotify not configured', results: [] });

  var type = params.type || 'track';
  var url = 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(params.q) + '&type=' + type + '&limit=10';

  var response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  var json = JSON.parse(response.getContentText());

  var results = [];

  if (type === 'track' && json.tracks) {
    results = json.tracks.items.map(function(t) {
      return {
        id: t.id,
        name: t.name,
        artist: t.artists.map(function(a) { return a.name; }).join(', '),
        album: t.album.name,
        coverUrl: t.album.images.length > 0 ? t.album.images[t.album.images.length - 1].url : '',
        spotifyUrl: t.external_urls.spotify
      };
    });
  } else if (type === 'album' && json.albums) {
    results = json.albums.items.map(function(a) {
      return {
        id: a.id,
        name: a.name,
        artist: a.artists.map(function(ar) { return ar.name; }).join(', '),
        coverUrl: a.images.length > 0 ? a.images[0].url : '',
        spotifyUrl: a.external_urls.spotify
      };
    });
  }

  return jsonResponse({ results: results });
}
