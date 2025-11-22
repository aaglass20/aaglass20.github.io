let searchIndex = [];

// Load the search index
fetch('/BDU/search-index.json')
    .then(response => response.json())
    .then(data => {
        searchIndex = data.pages;
        console.log('Search index loaded:', searchIndex.length, 'pages');
    })
    .catch(error => console.error('Error loading search index:', error));

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');

    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    const results = [];

    searchIndex.forEach(page => {
        // Search in page title
        if (page.title.toLowerCase().includes(query)) {
            results.push({ ...page, matchType: 'title' });
        }

        // Search in keywords
        if (page.keywords.some(k => k.toLowerCase().includes(query))) {
            if (!results.find(r => r.url === page.url)) {
                results.push({ ...page, matchType: 'keyword' });
            }
        }

        // Search in sections
        page.sections.forEach(section => {
            if (section.title.toLowerCase().includes(query)) {
                results.push({
                    ...page,
                    matchType: 'section',
                    matchedSection: section
                });
            }
        });
    });

    displayResults(results, query);
}

function displayResults(results, query) {
    const resultsDiv = document.getElementById('searchResults');
    let html = '';

    if (results.length === 0) {
        html = '<div class="search-result-item">No results found</div>';
    } else {
        results.forEach(result => {
            if (result.matchType === 'section' && result.matchedSection) {
                html += `<a href="${result.url}${result.matchedSection.anchor}" class="search-result-item section-result">
                    <i class="fas fa-arrow-right"></i> ${result.matchedSection.title}
                    <small style="display:block; color: #999; margin-top: 4px;">in ${result.title}</small>
                </a>`;
            } else {
                html += `<a href="${result.url}" class="search-result-item">
                    <strong>${result.title}</strong>
                </a>`;
            }
        });
    }

    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

// Hide results when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(event.target)) {
        document.getElementById('searchResults').style.display = 'none';
    }
});

// Add event listener when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                performSearch();
            }
        });
    }
});
