// Related Tools Recommendation Logic
// This script can be included in any tool page to automatically show related tools

function initRelatedTools(currentSlug) {
    // Check if relatedTools container exists
    const container = document.getElementById('relatedTools');
    if (!container) {
        console.warn('Related tools container not found, skipping related tools initialization');
        return;
    }
    
    // Tool icon mapping - using Font Awesome icons instead of images
    // This should be identical to the toolIcons in script.js to ensure consistent icons across pages
    const toolIcons = {
        "free-online-text-analysis-checker": "fas fa-chart-pie",
        "text-shortener-tool": "fas fa-compress-alt",
        "words-and-character-counter": "fas fa-list-ol",
        "text-formatter": "fas fa-align-justify",
        "duplicate-text-removal": "fas fa-clipboard-check",
        "remove-html-tags": "fas fa-code",
        "text-case-converter": "fas fa-text-height",
        "reverse-text-generator": "fas fa-sync-alt",
        "sort-text-lines": "fas fa-sort-numeric-down",
        "word-text-splitter": "fas fa-cut",
        "text-merger": "fas fa-file-alt",
        "text-character-replacement": "fas fa-search",
        "keyword-density-analyzer": "fas fa-chart-bar",
        "video-metadata-viewer": "fas fa-info-circle",
        "video-file-size-calculator": "fas fa-calculator",
        "video-duration-checker": "fas fa-stopwatch",
        "video-mime-type-detector": "fas fa-magic",
        "video-container-info-checker": "fas fa-box-open",
        "video-frame-extractor": "fas fa-camera-retro",
        "video-thumbnail-generator": "fas fa-images",
        "image-converter": "fas fa-exchange-alt",
        "image-resizer": "fas fa-expand-arrows-alt",
        "image-compressor": "fas fa-compress",
        "image-filters-effects-tool": "fas fa-magic",
        "image-annotation-tool": "fas fa-pen",
        "image-metadata-tool": "fas fa-info-circle",
        "image-pixel-color-tools": "fas fa-palette",
        "image-merge-split-tool": "fas fa-object-group",
        "image-background-mask-tool": "fas fa-layer-group"
    };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (de) from path for relative path calculation
    const languageCode = 'de';
    const languageIndex = nonEmptySegments.indexOf(languageCode);
    let relativeSegments = nonEmptySegments;
    
    if (languageIndex !== -1) {
        relativeSegments = nonEmptySegments.slice(languageIndex + 1);
    }
    
    // Calculate directory depth - excluding filename
    let directoryDepth = 0;
    if (relativeSegments.length > 0) {
        // If last segment contains extension (i.e., filename), subtract 1
        const lastSegment = relativeSegments[relativeSegments.length - 1];
        directoryDepth = lastSegment.includes('.') ? relativeSegments.length - 1 : relativeSegments.length;
    }
    // Calculate number of levels to go back based on directory depth
    const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
    // Detect language from URL (/bn/xxx or /zh/xxx or /en/xxx)
    const langMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
    const lang = langMatch ? langMatch[1] : 'en';
    
    // Load language-specific tools.json
    const toolsJsonPath = `/${lang}/data/tools.json`;
    
    fetch(toolsJsonPath)
        .then(res => res.json())
        .then(tools => {
            console.log('Tools loaded:', tools.length);
            console.log('Looking for slug:', currentSlug);
            const current = tools.find(t => t.slug === currentSlug);
            
            console.log('Current tool found:', current);
            
            if (current) {
                console.log('Current tool category:', current.category);
                console.log('Current tool tags:', current.tags);
                
                const related = tools
                    // First ensure to exclude the current tool regardless of other conditions
                    .filter(t => t.id !== current.id && t.slug !== currentSlug)
                    .map(t => {
                        let score = 0;
                        // Same category gets points
                        if (t.category === current.category) {
                            score += 3;
                            console.log('Same category with', t.name, 'adding 3 points');
                        }
                        // Points for same tags
                        t.tags.forEach(tag => {
                            if (current.tags.includes(tag)) {
                                score += 1;
                                console.log('Same tag', tag, 'with', t.name, 'adding 1 point');
                            }
                        });
                        // Popularity weighting
                        score += t.hot_score * 0.001;
                        console.log('Tool', t.name, 'score:', score);
                        return { ...t, score };
                    })
                    .filter(t => t.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
                
                console.log('Related tools found:', related.length);
                
                const container = document.getElementById('relatedTools');
                
                if (related.length > 0) {
                    container.innerHTML = related.map(tool => {
                            // Get Font Awesome icon class, use default if not found
                            const iconClass = toolIcons[tool.slug] || "fas fa-tools";
                            
                            // Determine the correct URL for the tool
                            let toolUrl = tool.url;
                            if (toolUrl === '#') {
                                // Placeholder links point to home page
                                toolUrl = `/${lang}/index.html`;
                            } else {
                                // All tools now use the correct path format, just add language prefix
                                toolUrl = `/${lang}/${toolUrl}`;
                            }
                            
                            return `
                                <a href="${toolUrl}" class="tool-card-link">
                                    <div class="tool-card">
                                        <div class="tool-icon">
                                            <i class="${iconClass}"></i>
                                        </div>
                                        <h3 class="tool-name">${tool.name}</h3>
                                        <p class="tool-description">${tool.description}</p>
                                    </div>
                                </a>
                            `;
                        }).join('');
                } else {
                    container.innerHTML = '<p class="text-center text-gray-500">No related tools found.</p>';
                }
            } else {
                console.error('Current tool not found with slug:', currentSlug);
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">Failed to load related tools.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading related tools:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">Failed to load related tools.</p>';
        });
}

// Export the function for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}
