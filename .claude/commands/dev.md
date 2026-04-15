# /dev — Start dev server for current project

Detect which project the user is working on and start the appropriate dev server.

## softball
```
cd /Users/aaronglass/git/aaglass20.github.io/softball
npm run dev
```
Runs Vite dev server at http://localhost:5173. Hot reload enabled.

## soundtrack (requires two processes)
Terminal 1 — Express API server:
```
cd /Users/aaronglass/git/aaglass20.github.io/soundtrack/server
node server.js
```
Runs at http://localhost:3001

Terminal 2 — React app:
```
cd /Users/aaronglass/git/aaglass20.github.io/soundtrack
npm start
```
Runs at http://localhost:3000

## All other projects (static HTML)
```
cd /Users/aaronglass/git/aaglass20.github.io
npx serve .
```
Or just open the HTML file directly in the browser.

## Steps
1. Identify which project the user is working on (ask if unclear)
2. Start the dev server(s) in the background
3. Report the URL(s) to open
4. For soundtrack: remind that both the API server AND the React app need to be running
