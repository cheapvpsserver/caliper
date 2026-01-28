// Related Tools Recommendation Logic
// This script can be included in any tool page to automatically show related tools

function initRelatedTools(currentSlug) {
    // Check if relatedTools container exists
    const container = document.getElementById('relatedTools');
    if (!container) {
        console.warn('संबंधित टूल्स कंटेनर नहीं मिला, संबंधित टूल्स की प्रारंभीकरण छोड़ दिया');
        return;
    }
    
    // Tool icon mapping - using Font Awesome icons instead of images
    // This should be identical to the toolIcons in script.js to ensure consistent icons across pages
    const toolIcons = {
            "पाठ विश्लेषण चेकर": "fas fa-chart-pie",
            "पाठ संक्षिप्तकर्ता टूल": "fas fa-compress-alt",
            "ऑनलाइन शब्द और वर्ण गिनती": "fas fa-list-ol",
            "पाठ स्वरूपक": "fas fa-align-justify",
            "दोहरे पाठ को हटाना": "fas fa-clipboard-check",
            "HTML टैग हटाएं": "fas fa-code",
            "पाठ केस कन्वर्टर": "fas fa-text-height",
            "रिवर्स टेक्स्ट जनरेटर": "fas fa-sync-alt",
            "पाठ पंक्तियों को क्रमबद्ध करें": "fas fa-sort-numeric-down",
            "शब्द पाठ विभाजक": "fas fa-cut",
            "पाठ मर्जर": "fas fa-file-alt",
            "पाठ वर्ण प्रतिस्थापन": "fas fa-search",
            "कीवर्ड घनत्व विश्लेषक": "fas fa-chart-bar",
            "छवि कन्वर्टर": "fas fa-exchange-alt",
            "छवि आकार बदलने वाला टूल": "fas fa-expand-arrows-alt",
            "छवि संपीडक": "fas fa-compress",
            "छवि फिल्टर और प्रभाव टूल": "fas fa-magic",
            "छवि एनोटेशन टूल": "fas fa-pen",
            "छवि पिक्सेल और रंग टूल": "fas fa-palette",
            "छवि मर्ज और स्प्लिट टूल": "fas fa-object-group",
            "पृष्ठभूमि और मास्क टूल": "fas fa-layer-group",
            "छवि मेटाडेटा और जानकारी": "fas fa-info-circle",
            "वीडियो मेटाडेटा व्यूअर": "fas fa-info-circle",
            "वीडियो फ़ाइल आकार कैलकुलेटर": "fas fa-calculator",
            "वीडियो अवधि चेकर": "fas fa-stopwatch",
            "वीडियो MIME प्रकार डिटेक्टर": "fas fa-magic",
            "वीडियो कंटेनर सूचना चेकर": "fas fa-box-open",
            "वीडियो फ्रेम एक्स्ट्रैक्टर": "fas fa-camera-retro",
            "वीडियो थंबनेल जनरेटर": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (de) from path for relative path calculation
    const languageCode = 'hi';
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
                            const iconClass = toolIcons[tool.name] || "fas fa-tools";
                            
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
                    container.innerHTML = '<p class="text-center text-gray-500">कोई संबंधित टूल नहीं मिला।</p>';
                }
            } else {
                console.error('Slug के साथ वर्तमान टूल नहीं मिला:', currentSlug);
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">संबंधित टूल्स लोड करने में विफल।</p>';
            }
        })
        .catch(error => {
            console.error('संबंधित टूल्स लोड करने में त्रुटि:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">संबंधित टूल्स लोड करने में विफल।</p>';
        });
}

// Export the function for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}
