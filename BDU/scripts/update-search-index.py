#!/usr/bin/env python3

"""
BDU Search Index Auto-Updater (Python Version)

This script automatically:
1. Scans all HTML files in the BDU root folder
2. Finds all collapsible sections
3. Adds missing section IDs based on section titles
4. Updates or creates entries in search-index.json

Usage: python3 scripts/update-search-index.py
"""

import os
import re
import json
from pathlib import Path
from html.parser import HTMLParser

# Configuration
SCRIPT_DIR = Path(__file__).parent
BDU_ROOT = SCRIPT_DIR.parent
SEARCH_INDEX_PATH = BDU_ROOT / 'search-index.json'
EXCLUDED_DIRS = {'menus', 'oldpractice', 'tryout', 'archive', 'futurePractice', 'plan',
                 'practice', 'gameprep', 'indoor', 'ican', 'fit', 'drills', 'concepts',
                 'tactical', 'scripts', 'css', 'images', 'vid', '.idea', 'untitled folder'}
EXCLUDED_FILES = {'index.html', 'current-practice.html', 'soccerlineup.html',
                  'soccer-tracker.html', 'soccer-tracker2.html', 'soccer-tracker3.html',
                  'randomColor.html', 'randomNumber.html', 'test.html', 'testw.html',
                  'game.html', 'agenda.html', 'cal.html', 'patty.html', 'u11.html'}


def title_to_anchor_id(title):
    """
    Convert a title string to a valid anchor ID

    Args:
        title (str): The section title

    Returns:
        str: The anchor ID
    """
    anchor = title.lower()
    anchor = re.sub(r'[\'"]', '', anchor)  # Remove quotes
    anchor = re.sub(r'&', 'and', anchor)  # Replace & with 'and'
    anchor = re.sub(r'\s+', '-', anchor)  # Replace spaces with hyphens
    anchor = re.sub(r'[^\w-]', '', anchor)  # Remove special characters except hyphens
    anchor = re.sub(r'-+', '-', anchor)  # Replace multiple hyphens with single hyphen
    anchor = re.sub(r'^-|-$', '', anchor)  # Remove leading/trailing hyphens
    return anchor


def generate_keywords(page_title):
    """
    Extract keywords from page title

    Args:
        page_title (str): The page title

    Returns:
        list: Array of keywords
    """
    keyword_map = {
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
        'foot skills': ['footwork', 'skills', 'technique', 'agility', 'control'],
        'speed': ['speed', 'sprint', 'acceleration', 'agility', 'quickness'],
        'warmup': ['warmup', 'preparation', 'activation', 'stretching', 'drills'],
        'scanning': ['scanning', 'awareness', 'vision', 'decision', 'observation'],
        'juggling': ['juggling', 'ball control', 'touch', 'coordination', 'practice'],
        'marking': ['marking', 'defending', 'coverage', 'positioning', 'pressure'],
        'fitness': ['fitness', 'conditioning', 'endurance', 'strength', 'training'],
        'tactics': ['tactics', 'strategy', 'formation', 'positioning', 'game plan'],
        'small-sided': ['small-sided', 'games', 'practice', 'drills', 'competitive'],
        '1v1': ['one-on-one', 'moves', 'skills', 'dribbling', 'attacking'],
        'striker': ['striker', 'forward', 'attacking', 'scoring', 'finishing'],
        'winger': ['winger', 'wide', 'crossing', 'attacking', 'flanks'],
        'midfielder': ['midfielder', 'central', 'passing', 'vision', 'control'],
        'centerback': ['defender', 'central', 'defending', 'positioning', 'tackles'],
        'outside back': ['fullback', 'wide', 'defending', 'overlapping', 'positioning']
    }

    lower_title = page_title.lower()
    for key, keywords in keyword_map.items():
        if key in lower_title:
            return keywords

    # Default keywords based on common terms
    words = lower_title.split()
    return (words[:4] + ['drills', 'training'])[:5]


class SectionExtractor(HTMLParser):
    """HTML Parser to extract section information"""

    def __init__(self):
        super().__init__()
        self.page_title = None
        self.sections = []
        self.current_section = None
        self.in_header = False
        self.in_h1 = False
        self.in_section = False
        self.in_h2 = False
        self.section_title_parts = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == 'header':
            self.in_header = True
        elif tag == 'h1' and self.in_header:
            self.in_h1 = True
        elif tag == 'section' and 'class' in attrs_dict and 'collapsible-section' in attrs_dict.get('class', ''):
            self.in_section = True
            self.current_section = {
                'id': attrs_dict.get('id'),
                'title': None
            }
        elif tag == 'h2' and self.in_section and 'class' in attrs_dict and 'section-title' in attrs_dict.get('class', ''):
            self.in_h2 = True
            self.section_title_parts = []
        elif tag == 'a' and self.in_h2:
            # Skip link tags in titles
            pass
        elif tag == 'i' and self.in_h2:
            # Skip icon tags
            pass
        elif tag == 'button' and self.in_h2:
            # Skip button tags
            pass

    def handle_endtag(self, tag):
        if tag == 'header':
            self.in_header = False
        elif tag == 'h1':
            self.in_h1 = False
        elif tag == 'section' and self.in_section:
            if self.current_section and self.current_section['title']:
                self.sections.append(self.current_section)
            self.in_section = False
            self.current_section = None
        elif tag == 'h2':
            if self.in_h2 and self.current_section:
                self.current_section['title'] = ' '.join(self.section_title_parts).strip()
            self.in_h2 = False

    def handle_data(self, data):
        if self.in_h1:
            if not self.page_title:
                self.page_title = data.strip()
        elif self.in_h2:
            text = data.strip()
            if text:
                self.section_title_parts.append(text)


def process_html_file(file_path):
    """
    Process an HTML file to extract or add section IDs

    Args:
        file_path (Path): Path to the HTML file

    Returns:
        dict|None: Page information or None if no sections found
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # Parse HTML to extract sections
        parser = SectionExtractor()
        parser.feed(html_content)

        if not parser.page_title:
            print(f"  ⚠️  No header h1 found in {file_path.name}")
            return None

        if not parser.sections:
            print(f"  ℹ️  No collapsible sections in {file_path.name}")
            return None

        # Process sections and add missing IDs
        section_data = []
        html_modified = False
        current_html = html_content

        for section in parser.sections:
            title = section['title']
            section_id = section['id']

            if not section_id:
                # Generate ID from title
                section_id = title_to_anchor_id(title)

                # Add ID to the HTML
                pattern = r'<section class="collapsible-section">'
                replacement = f'<section class="collapsible-section" id="{section_id}">'

                if pattern in current_html:
                    current_html = current_html.replace(pattern, replacement, 1)
                    html_modified = True
                    print(f'  ➕ Added ID "{section_id}" to section "{title}"')

            section_data.append({
                'title': title,
                'anchor': f'#{section_id}'
            })

        # Write back modified HTML if needed
        if html_modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(current_html)
            print(f"  ✅ Updated {file_path.name}")

        return {
            'title': parser.page_title,
            'url': file_path.name,
            'keywords': generate_keywords(parser.page_title),
            'sections': section_data
        }

    except Exception as e:
        print(f"  ❌ Error processing {file_path.name}: {str(e)}")
        return None


def get_html_files():
    """
    Get all HTML files from BDU root (excluding subdirectories and excluded files)

    Returns:
        list: Array of file paths
    """
    html_files = []
    for file_path in BDU_ROOT.glob('*.html'):
        if file_path.is_file() and file_path.name not in EXCLUDED_FILES:
            html_files.append(file_path)
    return html_files


def update_search_index(pages):
    """
    Update the search-index.json file

    Args:
        pages (list): Array of page data
    """
    try:
        # Sort pages alphabetically by title
        pages.sort(key=lambda p: p['title'])

        search_index = {
            'pages': pages
        }

        with open(SEARCH_INDEX_PATH, 'w', encoding='utf-8') as f:
            json.dump(search_index, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Updated search-index.json with {len(pages)} pages")
    except Exception as e:
        print(f"❌ Error updating search-index.json: {str(e)}")


def main():
    """Main execution function"""
    print('🔍 BDU Search Index Auto-Updater\n')
    print('Scanning HTML files in /BDU folder...\n')

    html_files = get_html_files()
    print(f"Found {len(html_files)} HTML files to process\n")

    pages = []
    processed_count = 0

    for file_path in html_files:
        print(f"Processing: {file_path.name}")

        page_data = process_html_file(file_path)
        if page_data:
            pages.append(page_data)
            processed_count += 1
        print()

    total_sections = sum(len(p['sections']) for p in pages)

    print(f"\n📊 Summary:")
    print(f"   Total files scanned: {len(html_files)}")
    print(f"   Pages with sections: {processed_count}")
    print(f"   Total sections indexed: {total_sections}")

    if pages:
        update_search_index(pages)
    else:
        print("\n⚠️  No pages to index")

    print("\n✨ Done!\n")


if __name__ == '__main__':
    main()
