// متعلقہ اوزار کی سفارش کا منطق
// اس اسکرپٹ کو کسی بھی ٹول کے صفحے میں شامل کیا جا سکتا ہے تاکہ خود بخود متعلقہ اوزار دکھائے جا سکیں

function initRelatedTools(currentSlug) {
    // Check if relatedTools container exists
    const container = document.getElementById('relatedTools');
    if (!container) {
        console.warn('Related tools container not found, skipping related tools initialization');
        return;
    }
    
    // ٹول آئیکن میپنگ - تصاویر کے بجائے فونٹ ایوسوم آئیکنز استعمال کرنا
    // یہ اسکرپٹ.جے ایس میں ٹول آئیکونز کے مشابہ ہونا چاہیے تاکہ تمام صفحات میں مسلسل آئیکونز کو یقینی بنایا جا سکے
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
    
    // موجودہ صفحہ کے مقام کی بنیاد پر tools.json کا صحیح راستہ متعین کریں
    // tools.json ہمیشہ ویب سائٹ کے روٹ میں ڈیٹا فولڈر میں ہوتا ہے
    const pathSegments = window.location.pathname.split('/');
    // خالی سٹرنگس کو فلٹر کریں
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // زبان کا کوڈ (ur) کو راستے کے حساب کے لیے ہٹا دیں
    const languageCode = 'ur';
    const languageIndex = nonEmptySegments.indexOf(languageCode);
    let relativeSegments = nonEmptySegments;
    
    if (languageIndex !== -1) {
        relativeSegments = nonEmptySegments.slice(languageIndex + 1);
    }
    
    // ڈائرکٹری کی گہرائی کا حساب کتاب - فائل نام کو چھوڑ کر
    let directoryDepth = 0;
    if (relativeSegments.length > 0) {
        // اگر آخری سیگمنٹ میں توسیع ہے (یعنی فائل نام)، تو 1 گھٹائیں
        const lastSegment = relativeSegments[relativeSegments.length - 1];
        directoryDepth = lastSegment.includes('.') ? relativeSegments.length - 1 : relativeSegments.length;
    }
    // ڈائرکٹری کی گہرائی کی بنیاد پر واپس جانے کے درجات کا حساب کتاب
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
                            // فونٹ ایوسوم آئیکن کلاس حاصل کریں، اگر نہیں ملتا تو ڈیفالٹ استعمال کریں
                            const iconClass = toolIcons[tool.slug] || "fas fa-tools";
                            
                            // ٹول کے لیے صحیح URL کا تعین کریں
                            let toolUrl = tool.url;
                            if (toolUrl === '#') {
                                // جگہ کے لنکس ہوم پیج کی طرف اشارہ کرتے ہیں
                                toolUrl = `/${lang}/index.html`;
                            } else {
                                // تمام ٹولز اب صحیح راستہ فارمیٹ استعمال کرتے ہیں، صرف زبان پریفکس شامل کریں
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
                    container.innerHTML = '<p class="text-center text-gray-500">کوئی متعلقہ اوزار نہیں ملا۔</p>';
                }
            } else {
                console.error('موجودہ ٹول اس سلگ کے ساتھ نہیں ملا:', currentSlug);
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">متعلقہ اوزار لوڈ کرنے میں ناکامی۔</p>';
            }
        })
        .catch(error => {
            console.error('متعلقہ اوزار لوڈ کرنے میں خرابی:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">متعلقہ اوزار لوڈ کرنے میں ناکامی۔</p>';
        });
}

// دیگر اسکرپٹس میں استعمال کے لیے فنکشن ایکسپورٹ کریں
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}
