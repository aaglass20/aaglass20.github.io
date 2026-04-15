# /bdu-update — Rebuild BDU search index

Run after adding or editing any BDU HTML page. Regenerates `search-index.json` which powers BDU's in-page search and auto-assigns section IDs to collapsible sections.

## Steps
1. Run the search index update script:
```
cd /Users/aaronglass/git/aaglass20.github.io/BDU
python3 scripts/update-search-index.py
```
2. Show a summary of what changed (new pages added, sections indexed)
3. Stage and commit the updated index:
```
git add BDU/search-index.json
git commit -m "update BDU search index"
```
4. Ask if the user also wants to push

## Important
- Never manually edit `search-index.json` — always regenerate it with the script
- If the script errors, check that the HTML file has proper collapsible section markup
