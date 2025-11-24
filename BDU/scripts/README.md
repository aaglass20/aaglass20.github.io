# BDU Search Index Auto-Updater

Automatically scans HTML files in the `/BDU` folder, adds missing section IDs, and updates `search-index.json`.

## Features

- 🔍 **Scans all HTML files** in BDU root folder (excludes subdirectories like menus, oldpractice, etc.)
- ➕ **Adds missing section IDs** to `<section class="collapsible-section">` tags
- 📝 **Updates search-index.json** with all pages and sections
- ✅ **Creates new entries** for new HTML files automatically
- 🔄 **Updates existing entries** when sections change

## Usage

### Python Version (Recommended)

```bash
# From the BDU directory
python3 scripts/update-search-index.py
```

### Node.js Version

```bash
# Install dependencies first (one-time)
cd scripts
npm install jsdom

# Run the script
cd ..
node scripts/update-search-index.js
```

## What It Does

### 1. Scans HTML Files
- Looks for all `.html` files in the `/BDU` root folder
- Excludes files in subdirectories (menus, oldpractice, tryout, etc.)
- Excludes utility files (index.html, current-practice.html, etc.)

### 2. Processes Each File
- Extracts the page title from `<header><h1>`
- Finds all `<section class="collapsible-section">` tags
- Extracts section titles from `<h2 class="section-title">`
- Checks if each section has an `id` attribute

### 3. Adds Missing IDs
If a section is missing an `id`, the script:
- Generates an ID from the section title
- Follows the pattern: lowercase, hyphens, no special characters
- Examples:
  - "5 Steps to defend like a pro" → `id="5-steps-to-defend-like-a-pro"`
  - "Liverpool Finishing Drill" → `id="liverpool-finishing-drill"`
  - "2 v 1 Rotational Finishing" → `id="2-v-1-rotational-finishing"`
- Updates the HTML file with the new ID

### 4. Updates search-index.json
- Creates an entry for each page with:
  - Page title
  - File URL
  - Relevant keywords
  - All sections with their titles and anchor links
- Sorts pages alphabetically by title
- Saves formatted JSON for easy reading

## ID Generation Rules

The script converts section titles to IDs using these rules:

1. Convert to lowercase
2. Remove quotes (`'` and `"`)
3. Replace `&` with `and`
4. Replace spaces with hyphens (`-`)
5. Remove special characters (except hyphens and alphanumeric)
6. Replace multiple hyphens with single hyphen
7. Remove leading/trailing hyphens

## Example Output

```
🔍 BDU Search Index Auto-Updater

Scanning HTML files in /BDU folder...

Found 63 HTML files to process

Processing: defensive-tactics.html
  ℹ️  All sections already have IDs

Processing: shooting.html
  ➕ Added ID "liverpool-finishing-drill" to section "Liverpool Finishing Drill"
  ➕ Added ID "reaction-finishing" to section "Reaction Finishing"
  ✅ Updated shooting.html

...

📊 Summary:
   Total files scanned: 63
   Pages with sections: 58
   Total sections indexed: 280

✅ Updated search-index.json with 58 pages

✨ Done!
```

## When to Run

Run this script whenever you:

- ✏️ Add a new HTML page with collapsible sections
- ➕ Add new sections to an existing page
- 📝 Rename section titles
- 🔄 Want to regenerate the search index

## Excluded Files

The script automatically excludes:

**Directories:**
- menus/
- oldpractice/
- tryout/
- archive/
- futurePractice/
- practice/
- gameprep/
- indoor/
- ican/
- fit/
- drills/
- concepts/
- tactical/
- scripts/
- css/
- images/
- vid/

**Files:**
- index.html
- current-practice.html
- Soccer tracker files
- Utility files (randomColor.html, test.html, etc.)

## Customization

To modify keyword generation or excluded files, edit the configuration at the top of the script:

```python
# In update-search-index.py
EXCLUDED_DIRS = {'menus', 'oldpractice', ...}
EXCLUDED_FILES = {'index.html', ...}

# Modify keyword_map in generate_keywords() function
```

## Troubleshooting

**Problem:** Script doesn't find any files
- Check you're running from the `/BDU` directory
- Verify HTML files exist in the root folder

**Problem:** IDs not being added
- Check that sections have class="collapsible-section"
- Verify sections have h2.section-title inside them

**Problem:** Import errors (Python)
- No external dependencies needed - uses only Python standard library

**Problem:** Module not found (Node.js)
- Run `npm install jsdom` in the scripts directory

## Output Files

- **HTML files**: Modified in-place with new section IDs
- **search-index.json**: Completely regenerated with all pages

Always commit changes to git after running!
