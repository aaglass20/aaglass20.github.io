# Soundtrack of My Life - Setup Guide

## 1. Google Sheets Setup

1. Create a new Google Sheet
2. Create 5 tabs with these exact names and headers (Row 1):

**Users tab:**
| userId | name | pinHash | birthYear | createdAt |

**TimelineSongs tab:**
| userId | year | songTitle | artist | spotifyId | spotifyUrl |

**FavoriteSongs tab:**
| userId | rank | songTitle | artist | spotifyId | spotifyUrl |

**FavoriteAlbums tab:**
| userId | rank | albumTitle | artist | spotifyId | spotifyUrl | coverUrl |

**Likes tab:**
| likerUserId | targetUserId | songTitle | artist | spotifyId | context | likedAt |

## 2. Apps Script Deployment

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Replace the default code with the contents of `apps-script/Code.gs`
3. Click **Deploy > New deployment**
4. Select **Web app**
5. Set "Execute as" to **Me**
6. Set "Who has access" to **Anyone**
7. Click **Deploy** and copy the Web app URL

## 3. Spotify API (Optional)

1. Go to https://developer.spotify.com/dashboard
2. Create an app, get Client ID and Client Secret
3. In Apps Script, go to **Project Settings > Script Properties**
4. Add:
   - `SPOTIFY_CLIENT_ID` = your client ID
   - `SPOTIFY_CLIENT_SECRET` = your client secret

## 4. Configure the React App

Edit `src/config.js`:
```js
export const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
export const SHEETS_CONFIGURED = true;
```

## 5. Run Locally

```bash
cd soundtrack
npm start
```

## 6. Deploy to GitHub Pages

```bash
npm run build
```

Then commit and push. The app will be live at `https://aaglass20.github.io/soundtrack/`.
