# /new-softball-situation — Add a new situation to the Softball app

Add a new animated softball situation (play scenario) to the app's situation library.

## Steps
1. Ask for the situation details if not provided:
   - **Name**: short label (e.g. "Runner on 2nd, ground ball to short")
   - **Situation type**: baserunning, fielding, hitting, or bunt coverage
   - **Starting positions**: which bases have runners; fielder positions
   - **Play sequence**: what happens (where the ball goes, runner movement)

2. Open `src/data/sampleSituations.js` and study the existing situation schema

3. Add the new situation object following the exact same schema:
   - Correct position coordinates for the Konva canvas dimensions
   - Proper keyframe structure for animation steps
   - Appropriate category/tags

4. Start the dev server (`npm run dev`) and verify the situation appears and animates correctly

5. Commit the change:
```
git add softball/src/data/sampleSituations.js
git commit -m "add softball situation: <name>"
```

## Key file
`/Users/aaronglass/git/aaglass20.github.io/softball/src/data/sampleSituations.js`
