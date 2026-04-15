# /new-bdu-page — Scaffold a new BDU training page

Create a new HTML page in the BDU soccer coaching library. The user should provide a topic (e.g. "pressing triggers", "corner kicks attacking", "1v1 defending").

## Steps
1. Ask for the page topic if not provided
2. Determine the best BDU subdirectory (attacking/, defending/, fitness/, etc.) or root BDU/ if it doesn't fit a subdirectory
3. Generate a filename in kebab-case (e.g. `pressing-triggers.html`)
4. Create the page using the standard BDU HTML template:
   - Same `<head>` includes as nearby pages (jQuery, shared CSS, collapsible section JS)
   - Navigation header matching other BDU pages
   - At least 2-3 collapsible sections relevant to the topic with placeholder content
   - Back link to the appropriate index page
5. After creating the file, run `/bdu-update` to rebuild the search index
6. Ask if the user wants to add content to any of the sections

## Template structure to follow
Look at an existing BDU page in the same subdirectory for the exact header/nav/footer structure before creating the new file.
