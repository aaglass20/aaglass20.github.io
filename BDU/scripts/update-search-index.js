#!/usr/bin/env node

/**
 * BDU Search Index Auto-Updater
 *
 * This script automatically:
 * 1. Scans all HTML files in the BDU root folder
 * 2. Finds all collapsible sections
 * 3. Adds missing section IDs based on section titles
 * 4. Updates or creates entries in search-index.json
 *
 * Usage: node scripts/update-search-index.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const BDU_ROOT = path.join(__dirname, '..');
const SEARCH_INDEX_PATH = path.join(BDU_ROOT, 'search-index.json');
const EXCLUDED_DIRS = ['menus', 'oldpractice', 'tryout', 'archive', 'futurePractice', 'plan', 'practice', 'gameprep', 'indoor', 'ican', 'fit', 'drills', 'concepts', 'tactical', 'scripts', 'css', 'images', 'vid', '.idea', 'untitled folder'];
const EXCLUDED_FILES = ['index.html', 'current-practice.html', 'soccerlineup.html', 'soccer-tracker.html', 'soccer-tracker2.html', 'soccer-tracker3.html', 'randomColor.html', 'randomNumber.html', 'test.html', 'testw.html', 'game.html', 'agenda.html', 'cal.html', 'patty.html', 'u11.html'];

/**
 * Convert a title string to a valid anchor ID
 * @param {string} title - The section title
 * @returns {string} The anchor ID
 */
function titleToAnchorId(title) {
    return title
        .toLowerCase()
        .replace(/['"]/g, '') // Remove quotes
        .replace(/&/g, 'and') // Replace & with 'and'
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w-]/g, '') // Remove special characters except hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract keywords from page title
 * @param {string} pageTitle - The page title
 * @returns {string[]} Array of keywords
 */
function generateKeywords(pageTitle) {
    const keywordMap = {
        'defensive': ['defense', 'defending', 'tactical', 'positioning', 'tackles'],
        'offensive': ['offense', 'attacking', 'tactics', 'strategy', 'pressure'],
        'ball control': ['control', 'touch', 'mastery', 'technique', 'footwork'],
        'shooting': ['shooting', 'finishing', 'goals', 'striker', 'accuracy'],
        'passing': ['passing', 'distribution', 'accuracy', 'technique', 'combination'],
        'dribbling': ['dribbling', 'moves', 'skills', 'feints', 'agility'],
        'goalkeeper': ['goalkeeper', 'saves', 'diving', 'distribution', 'positioning'],
        'goalie': ['goalkeeper', 'saves', 'diving', 'distribution', 'positioning'],
        'trapping': ['trapping', 'receiving', 'control', 'technique', 'cushion'],
        'heading': ['heading', 'headers', 'aerial', 'technique', 'power'],
        'turns': ['turns', 'rotation', 'pivoting', 'direction', 'change'],
        'crossing': ['crossing', 'delivery', 'wings', 'service', 'flanks'],
        'footskills': ['footwork', 'skills', 'technique', 'agility', 'control'],
        'speed': ['speed', 'sprint', 'acceleration', 'agility', 'quickness'],
        'warmup': ['warmup', 'preparation', 'activation', 'stretching', 'drills'],
        'scanning': ['scanning', 'awareness', 'vision', 'decision', 'observation'],
        'juggling': ['juggling', 'ball control', 'touch', 'coordination', 'practice'],
        'marking': ['marking', 'defending', 'coverage', 'positioning', 'pressure'],
        'fitness': ['fitness', 'conditioning', 'endurance', 'strength', 'training'],
        'tactics': ['tactics', 'strategy', 'formation', 'positioning', 'game plan'],
        'small-sided': ['small-sided', 'games', 'practice', 'drills', 'competitive']
    };

    const lowerTitle = pageTitle.toLowerCase();
    for (const [key, keywords] of Object.entries(keywordMap)) {
        if (lowerTitle.includes(key)) {
            return keywords;
        }
    }

    // Default keywords based on common terms
    const words = pageTitle.toLowerCase().split(/\s+/);
    return words.slice(0, 4).concat(['drills', 'training']).slice(0, 5);
}

/**
 * Process an HTML file to extract or add section IDs
 * @param {string} filePath - Path to the HTML file
 * @returns {object|null} Page information or null if no sections found
 */
function processHtmlFile(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Get page title from h1 in header
        const headerH1 = document.querySelector('header h1');
        if (!headerH1) {
            console.log(`  ⚠️  No header h1 found in ${path.basename(filePath)}`);
            return null;
        }

        const pageTitle = headerH1.textContent.trim();

        // Find all collapsible sections
        const sections = document.querySelectorAll('section.collapsible-section');
        if (sections.length === 0) {
            console.log(`  ℹ️  No collapsible sections in ${path.basename(filePath)}`);
            return null;
        }

        const sectionData = [];
        let htmlModified = false;
        let currentHtml = html;

        sections.forEach((section) => {
            const h2 = section.querySelector('h2.section-title');
            if (!h2) return;

            // Extract title text (excluding icon and button)
            let title = '';
            h2.childNodes.forEach(node => {
                if (node.nodeType === 3) { // Text node
                    title += node.textContent.trim();
                } else if (node.tagName === 'A') {
                    title += node.textContent.trim();
                }
            });
            title = title.trim();

            if (!title) return;

            // Check if section has an ID
            let sectionId = section.getAttribute('id');

            if (!sectionId) {
                // Generate ID from title
                sectionId = titleToAnchorId(title);

                // Add ID to the HTML
                const sectionStartTag = currentHtml.match(/<section class="collapsible-section"[^>]*>/);
                if (sectionStartTag) {
                    const updatedTag = `<section class="collapsible-section" id="${sectionId}">`;
                    currentHtml = currentHtml.replace(/<section class="collapsible-section">/, updatedTag);
                    htmlModified = true;
                    console.log(`  ➕ Added ID "${sectionId}" to section "${title}"`);
                }
            }

            sectionData.push({
                title: title,
                anchor: `#${sectionId}`
            });
        });

        // Write back modified HTML if needed
        if (htmlModified) {
            fs.writeFileSync(filePath, currentHtml, 'utf-8');
            console.log(`  ✅ Updated ${path.basename(filePath)}`);
        }

        return {
            title: pageTitle,
            url: path.basename(filePath),
            keywords: generateKeywords(pageTitle),
            sections: sectionData
        };

    } catch (error) {
        console.error(`  ❌ Error processing ${path.basename(filePath)}: ${error.message}`);
        return null;
    }
}

/**
 * Get all HTML files from BDU root (excluding subdirectories and excluded files)
 * @returns {string[]} Array of file paths
 */
function getHtmlFiles() {
    const files = fs.readdirSync(BDU_ROOT);
    return files
        .filter(file => {
            if (!file.endsWith('.html')) return false;
            if (EXCLUDED_FILES.includes(file)) return false;

            const filePath = path.join(BDU_ROOT, file);
            const stat = fs.statSync(filePath);
            return stat.isFile();
        })
        .map(file => path.join(BDU_ROOT, file));
}

/**
 * Update the search-index.json file
 * @param {object[]} pages - Array of page data
 */
function updateSearchIndex(pages) {
    try {
        // Sort pages alphabetically by title
        pages.sort((a, b) => a.title.localeCompare(b.title));

        const searchIndex = {
            pages: pages
        };

        fs.writeFileSync(
            SEARCH_INDEX_PATH,
            JSON.stringify(searchIndex, null, 2),
            'utf-8'
        );

        console.log(`\n✅ Updated search-index.json with ${pages.length} pages`);
    } catch (error) {
        console.error(`❌ Error updating search-index.json: ${error.message}`);
    }
}

/**
 * Main execution function
 */
function main() {
    console.log('🔍 BDU Search Index Auto-Updater\n');
    console.log('Scanning HTML files in /BDU folder...\n');

    const htmlFiles = getHtmlFiles();
    console.log(`Found ${htmlFiles.length} HTML files to process\n`);

    const pages = [];
    let processedCount = 0;

    htmlFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        console.log(`Processing: ${fileName}`);

        const pageData = processHtmlFile(filePath);
        if (pageData) {
            pages.push(pageData);
            processedCount++;
        }
        console.log('');
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total files scanned: ${htmlFiles.length}`);
    console.log(`   Pages with sections: ${processedCount}`);
    console.log(`   Total sections indexed: ${pages.reduce((sum, p) => sum + p.sections.length, 0)}`);

    if (pages.length > 0) {
        updateSearchIndex(pages);
    } else {
        console.log('\n⚠️  No pages to index');
    }

    console.log('\n✨ Done!\n');
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { titleToAnchorId, generateKeywords, processHtmlFile };
