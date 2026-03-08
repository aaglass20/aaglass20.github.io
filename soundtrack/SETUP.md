# Soundtrack of My Life - Setup Guide

## 1. Google Sheets Setup

1. Create a new Google Sheet
2. Create 6 tabs with these exact names and headers (Row 1):

**Users tab:**
| userId | name | pinHash | birthYear | createdAt |

**TimelineSongs tab:**
| userId | year | songTitle | artist | spotifyId | spotifyUrl | story |

**FavoriteSongs tab:**
| userId | rank | songTitle | artist | spotifyId | spotifyUrl |

**FavoriteAlbums tab:**
| userId | rank | albumTitle | artist | spotifyId | spotifyUrl | coverUrl |

**Likes tab:**
| likerUserId | targetUserId | songTitle | artist | spotifyId | context | likedAt |

**FollowedUsers tab:**
| userId | followedUserId | groupName | createdAt |

## 2. Apps Script Deployment

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Replace the default code with the contents of `apps-script/Code.gs`
3. Click **Deploy > New deployment**
4. Select **Web app**
5. Set "Execute as" to **Me**
6. Set "Who has access" to **Anyone**
7. Click **Deploy** and copy the Web app URL

## 3. Apps Script Actions

The backend handles these actions (passed as `action` parameter):

| Action | Method | Parameters | Description |
|--------|--------|------------|-------------|
| `createUser` | POST | name, pinHash, birthYear | Create a new user |
| `verifyPin` | GET | name, pinHash | Verify login credentials |
| `resetPin` | GET | name, birthYear, newPinHash | Reset PIN after verifying birth year matches stored value |
| `getUser` | GET | userId | Get user profile |
| `getAllUsers` | GET | — | List all users |
| `getUserTimeline` | GET | userId | Get a user's timeline songs |
| `saveTimelineSong` | POST | userId, year, songTitle, artist, spotifyId, spotifyUrl | Save a song to timeline |
| `deleteTimelineSong` | POST | userId, year | Remove a song from timeline |
| `saveTimelineStory` | POST | userId, year, story | Save a story/memory for a timeline year |
| `getUserFavoriteSongs` | GET | userId | Get favorite songs list |
| `saveFavoriteSongs` | POST | userId, songs | Save ranked favorite songs |
| `getUserFavoriteAlbums` | GET | userId | Get favorite albums list |
| `saveFavoriteAlbums` | POST | userId, albums | Save ranked favorite albums |
| `getLikes` | GET | — | Get all likes |
| `getUserLikes` | GET | userId | Get likes for a user |
| `likeSong` | POST | likerUserId, targetUserId, songTitle, artist, spotifyId, context | Like a song |
| `unlikeSong` | POST | likerUserId, spotifyId | Remove a like |
| `getSuperChart` | GET | — | Get aggregated chart |
| `getFollowedUsers` | GET | userId | Get users this person follows |
| `getFollowedUsersActivity` | GET | userId | Get activity from followed users |
| `followUser` | POST | userId, followedUserId, groupName | Follow a user (group: Family, Friends, Coworkers, Other) |
| `unfollowUser` | POST | userId, followedUserId | Unfollow a user |
| `updateFollowGroup` | POST | userId, followedUserId, groupName | Change a followed user's group |

**`resetPin` implementation note:** Look up the user by name in the Users tab, verify that the `birthYear` parameter matches the stored value, then update the `pinHash` column with `newPinHash`. Return `{ success: true }` or `{ success: false, error: "..." }`.

## 4. Spotify API (Optional)


1. Go to https://developer.spotify.com/dashboard
2. Create an app, get Client ID and Client Secret
3. In Apps Script, go to **Project Settings > Script Properties**
4. Add:
   - `SPOTIFY_CLIENT_ID` = your client ID
   - `SPOTIFY_CLIENT_SECRET` = your client secret

## 5. Configure the React App

Edit `src/config.js`:
```js
export const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
export const SHEETS_CONFIGURED = true;
```

## 6. Run Locally

```bash
cd soundtrack
npm start
```

## 7. Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the app and copies the output so GitHub Pages can serve it. Then commit and push. The app will be live at `https://aaglass20.github.io/soundtrack/`.
