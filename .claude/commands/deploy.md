# /deploy — Deploy current project to GitHub Pages

Detect which project the user is currently working in based on context (recently opened files, current topic, or explicit mention), then run the correct deploy flow.

## softball
```
cd /Users/aaronglass/git/aaglass20.github.io/softball
npm run deploy
```
Then git add + commit + push the changed files (`index.html`, `assets/`).

## soundtrack
```
cd /Users/aaronglass/git/aaglass20.github.io/soundtrack
npm run deploy
```
This copies `build/*` to the repo root. Then git add + commit + push.

## All other projects (BDU, brackets, mybracketly, fantasy-baseball, ncaa, signs)
These are static — just commit and push the changed HTML/JS/CSS files:
```
git add <changed files>
git commit -m "<description>"
git push
```

## Steps
1. Identify which project is being deployed (ask if unclear)
2. For React projects: run the build, show output, confirm success before committing
3. Stage only the relevant files — never `git add .` blindly
4. Commit with a concise message describing what changed
5. Push and confirm
