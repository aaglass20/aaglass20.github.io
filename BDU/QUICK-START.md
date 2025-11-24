# BDU Search Index - Quick Start Guide

## 🚀 Quick Command

Whenever you add or update HTML pages with sections, run:

```bash
cd /Users/aaronglass/git/aaglass20.github.io/BDU
python3 scripts/update-search-index.py
```

That's it! The script will:
- ✅ Add missing IDs to all sections
- ✅ Update search-index.json automatically
- ✅ Show you what changed

## 📝 How to Add New Content

### 1. Create or Edit an HTML Page

Your HTML page should have:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Standard BDU header -->
</head>
<body>
<header>
    <div class="highlight-banner">
        <h1>Your Page Title</h1>
    </div>
</header>

<div class="container">

    <!-- Add collapsible sections like this -->
    <section class="collapsible-section">
        <h2 class="section-title">
            <i class="fas fa-futbol"></i> Your Section Title
            <button class="toggle-button" aria-expanded="false">
                <i class="fas fa-chevron-down"></i>
            </button>
        </h2>
        <p class="drill-summary">
            Brief description of the section
        </p>
        <div class="collapsible-content">
            <!-- Your content here -->
        </div>
    </section>

    <!-- Add more sections as needed -->

</div>
</body>
</html>
```

### 2. Save Your HTML File

Save it in the `/BDU` root folder with a descriptive name:
- `your-topic.html`
- Use lowercase and hyphens
- Examples: `advanced-passing.html`, `youth-drills.html`

### 3. Run the Update Script

```bash
python3 scripts/update-search-index.py
```

The script will:
- Detect your new page
- Add `id` attributes to all sections (e.g., `id="your-section-title"`)
- Add your page to search-index.json
- Generate relevant keywords automatically

### 4. Done! 🎉

Your new page is now:
- ✅ Searchable via the search box
- ✅ Has direct links to each section
- ✅ Properly indexed

## 🔍 What Happens Automatically

### Sections Without IDs → IDs Added

**Before:**
```html
<section class="collapsible-section">
    <h2 class="section-title">Liverpool Finishing Drill</h2>
```

**After (script adds the ID):**
```html
<section class="collapsible-section" id="liverpool-finishing-drill">
    <h2 class="section-title">Liverpool Finishing Drill</h2>
```

### search-index.json Gets Updated

```json
{
  "pages": [
    {
      "title": "Shooting",
      "url": "shooting.html",
      "keywords": ["shooting", "finishing", "goals", "striker", "accuracy"],
      "sections": [
        {
          "title": "Liverpool Finishing Drill",
          "anchor": "#liverpool-finishing-drill"
        }
      ]
    }
  ]
}
```

## 📋 Checklist for New Pages

- [ ] Page has `<header><h1>` with title
- [ ] Sections use `class="collapsible-section"`
- [ ] Section titles use `<h2 class="section-title">`
- [ ] File saved in `/BDU` root (not in subdirectories)
- [ ] Run `python3 scripts/update-search-index.py`
- [ ] Check output to verify page was processed
- [ ] Test search functionality

## 🛠️ Troubleshooting

**Q: My page isn't showing up in search**
- Check that the file is in `/BDU` root, not a subdirectory
- Verify sections have `class="collapsible-section"`
- Run the script again and check for errors

**Q: Section IDs aren't being added**
- Ensure `<h2 class="section-title">` exists inside each section
- Check that section title has actual text content
- Look for error messages in script output

**Q: How do I exclude a file from indexing?**
- Edit `scripts/update-search-index.py`
- Add filename to `EXCLUDED_FILES` set at the top

## 📚 More Information

See `scripts/README.md` for complete documentation.

## 🎯 Examples

**Good section structure:**
```html
<section class="collapsible-section" id="3-station-finishing">
    <h2 class="section-title">
        <i class="fas fa-futbol"></i> 3 Station Finishing
        <button class="toggle-button">...</button>
    </h2>
    <div class="collapsible-content">...</div>
</section>
```

**Link to a specific section:**
```html
<a href="shooting.html#3-station-finishing">Jump to 3 Station Finishing</a>
```

**In search results:**
Users can search for "3 station" or "finishing" and will find this drill with a direct link.
