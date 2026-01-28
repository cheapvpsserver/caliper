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
            "Text Analysis Checker": "fas fa-chart-pie",
            "Text Shortener Tool": "fas fa-compress-alt",
            "Online Words and Character Counter": "fas fa-list-ol",
            "Text Formatter": "fas fa-align-justify",
            "Duplicate Text Removal": "fas fa-clipboard-check",
            "Remove HTML Tags": "fas fa-code",
            "Text Case Converter": "fas fa-text-height",
            "Reverse Text Generator": "fas fa-sync-alt",
            "Sort Text Lines": "fas fa-sort-numeric-down",
            "Word Text Splitter": "fas fa-cut",
            "Text Merger": "fas fa-file-alt",
            "Text Character Replacement": "fas fa-search",
            "Keyword Density Analyzer": "fas fa-chart-bar",
            "Image Converter": "fas fa-exchange-alt",
            "Image Resizer": "fas fa-expand-arrows-alt",
            "Image Compressor": "fas fa-compress",
            "Image Filters & Effects Tool": "fas fa-magic",
            "Image Annotation Tool": "fas fa-pen",
            "Image Metadata & Info": "fas fa-info-circle",
            "Image Pixel & Color Tools": "fas fa-palette",
            "Image Merge & Split Tool": "fas fa-object-group",
            "Background & Mask Tool": "fas fa-layer-group",
            "Video Metadata Viewer": "fas fa-info-circle",
            "Video File Size Calculator": "fas fa-calculator",
            "Video Duration Checker": "fas fa-stopwatch",
            "Video MIME Type Detector": "fas fa-magic",
            "Video Container Info Checker": "fas fa-box-open",
            "Video Frame Extractor": "fas fa-camera-retro",
            "Video Thumbnail Generator": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    // Calculate directory depth - excluding filename
    let directoryDepth = 0;
    if (nonEmptySegments.length > 0) {
        // If the last segment contains extension (i.e., filename), subtract 1
        const lastSegment = nonEmptySegments[nonEmptySegments.length - 1];
        directoryDepth = lastSegment.includes('.') ? nonEmptySegments.length - 1 : nonEmptySegments.length;
    }
    // Calculate the number of levels to go back based on directory depth
    const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
    const toolsJsonPath = `${basePath}data/tools.json`;
    
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
                            const iconClass = toolIcons[tool.name] || "fas fa-tools";
                            
                            // Determine the correct URL for the tool
                            let toolUrl = tool.url;
                            if (toolUrl === '#') {
                                // Placeholder links point to home page
                                toolUrl = `${basePath}index.html`;
                            } else {
                                // Check if we're on an Italian language page (URL contains /it/)
                                const isItalianPage = window.location.pathname.includes('/it/');
                                // All tools now use the correct path format, just add basePath
                                // For Italian pages, add 'it/' prefix to the tool URL
                                toolUrl = isItalianPage ? `${basePath}it/${toolUrl}` : `${basePath}${toolUrl}`;
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