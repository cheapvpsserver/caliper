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
            "টেক্সট বিশ্লেষণ চেকার": "fas fa-chart-pie",
            "টেক্সট ছোট করণ টুল": "fas fa-compress-alt",
            "অনলাইন ওয়ার্ডস এবং ক্যারেক্টার কাউন্টার": "fas fa-list-ol",
            "টেক্সট ফরমেটার": "fas fa-align-justify",
            "ডুপ্লিকেট টেক্সট রিমুভাল": "fas fa-clipboard-check",
            "এইচটিএমএল ট্যাগ রিমুভ করুন": "fas fa-code",
            "টেক্সট কেস কনভার্টার": "fas fa-text-height",
            "রিভার্স টেক্সট জেনারেটর": "fas fa-sync-alt",
            "টেক্সট লাইনগুলি সাজান": "fas fa-sort-numeric-down",
            "ওয়ার্ড টেক্সট স্প্লিটার": "fas fa-cut",
            "টেক্সট মার্জার": "fas fa-file-alt",
            "টেক্সট ক্যারেক্টার রিপ্লেসমেন্ট": "fas fa-search",
            "কীওয়ার্ড ডেনসিটি এনালাইজার": "fas fa-chart-bar",
            "ইমেজ কনভার্টার": "fas fa-exchange-alt",
            "ইমেজ রিসাইজার": "fas fa-expand-arrows-alt",
            "ইমেজ কম্প্রেসর": "fas fa-compress",
            "ইমেজ ফিল্টার্স এবং ইফেক্টস টুল": "fas fa-magic",
            "ইমেজ এনোটেশন টুল": "fas fa-pen",
            "ইমেজ পিক্সেল এবং কালার টুল": "fas fa-palette",
            "ইমেজ মার্জ এবং স্প্লিট টুল": "fas fa-object-group",
            "ব্যাকগ্রাউন্ড এবং মাস্ক টুল": "fas fa-layer-group",
            "ইমেজ মেটাডেটা এবং ইনফো": "fas fa-info-circle",
            "ভিডিও মেটাডেটা ভিউয়ার": "fas fa-info-circle",
            "ভিডিও ফাইল সাইজ ক্যালকুলেটর": "fas fa-calculator",
            "ভিডিও ডিউরেশন চেকার": "fas fa-stopwatch",
            "ভিডিও এমআইএম টাইপ ডিটেক্টর": "fas fa-magic",
            "ভিডিও কন্টেইনার ইনফো চেকার": "fas fa-box-open",
            "ভিডিও ফ্রেম এক্সট্রাক্টর": "fas fa-camera-retro",
            "ভিডিও থাম্বনেইল জেনারেটর": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (bn) from path for relative path calculation
    const languageCode = 'bn';
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
                                toolUrl = `/${lang}/${tool.url}`;
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
                    container.innerHTML = '<p class="text-center text-gray-500">কোন সম্পর্কিত টুল পাওয়া যায়নি।</p>';
                }
            } else {
                console.error('Current tool not found with slug:', currentSlug);
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">সম্পর্কিত টুলগুলি লোড করতে ব্যর্থ হয়েছে।</p>';
            }
        })
        .catch(error => {
            console.error('Error loading related tools:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">সম্পর্কিত টুলগুলি লোড করতে ব্যর্থ হয়েছে।</p>';
        });
}

// Export the function for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}
