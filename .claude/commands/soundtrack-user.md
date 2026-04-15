# /soundtrack-user — Add or manage a Soundtrack user

Add a new user to the Soundtrack app, or update an existing user's profile.

## How users work
- Users are stored in MongoDB Atlas (`soundtrack` db → `users` collection)
- Auth is PIN-based (4-digit PIN stored with user record)
- The Express API server handles user creation via POST endpoints
- Frontend: `src/pages/LoginPage.js` handles login/register flow

## Adding a new user (via the app UI — preferred)
1. Open `https://aaglass20.github.io/soundtrack`
2. On the login page, click "Create Account"
3. Enter name, userId (no spaces), and 4-digit PIN
4. The app calls the API server → MongoDB Atlas

## Adding a new user (via API — for admin/bulk)
The Express server must be running (`https://soundtrack-api.onrender.com`).
```
POST /api/createUser
Body: { "name": "...", "userId": "...", "pin": "1234" }
```

## Checking existing users
```
curl https://soundtrack-api.onrender.com/api/getAllUsers
```
Returns array of users with name, userId, songCount.

## If the API server is cold (Render free tier sleeps)
The server auto-wakes on first request but takes ~30–60 seconds.
Test with: `curl --max-time 90 https://soundtrack-api.onrender.com/api/getAllUsers`

## User data stored in MongoDB
- `users` collection: userId (unique), name, pin, joinDate
- `timeline` collection: userId + year (unique) → song list
- `favoriteSongs`: userId → ranked songs list
- `favoriteAlbums`: userId → ranked albums list
- `likes`: likerUserId + spotifyId (unique)
