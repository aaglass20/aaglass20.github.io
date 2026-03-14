# Soundtrack of My Life

A web app where users build a musical autobiography — mapping songs to years of their life, curating favorites, and following friends to see their soundtracks.

## Features

- **Timeline** — Assign a song to each year of your life, with optional stories
- **Favorite Songs** — Rank your top songs with drag-and-drop reordering
- **Favorite Albums** — Rank your top albums
- **My People** — Follow friends, organize them into groups (Family, Friends, Coworkers, Other), and see new activity since your last visit
- **Browse** — Discover and follow other users
- **View Soundtrack** — View any user's full timeline, favorites, and like their songs
- **SuperChart** — Aggregated chart across all users

## Tech Stack

- **Frontend:** React 19, React Router (HashRouter), @hello-pangea/dnd
- **Backend:** Google Apps Script (Google Sheets as database)
- **Music Data:** Spotify API (search, embeds, top songs by year)
- **Hosting:** GitHub Pages

## Google Sheets Schema

| Sheet | Columns |
|-------|---------|
| Users | userId, name, pinHash, birthYear, createdAt |
| TimelineSongs | userId, year, songTitle, artist, spotifyId, spotifyUrl, story, addedAt |
| FavoriteSongs | userId, rank, songTitle, artist, spotifyId, spotifyUrl, addedAt |
| FavoriteAlbums | userId, rank, albumTitle, artist, spotifyId, spotifyUrl, coverUrl |
| Likes | likerUserId, targetUserId, songTitle, artist, spotifyId, context, likedAt |
| FollowedUsers | userId, followedUserId, groupName, createdAt |

## Scripts

```bash
npm start       # Dev server on localhost:3000
npm run build   # Production build
npm run deploy  # Build + copy to root for GitHub Pages
```

## Deployment

The app is hosted via GitHub Pages at the `/soundtrack` path. Running `npm run deploy` builds the app and copies the output from `build/` to the project root so GitHub Pages can serve it directly.