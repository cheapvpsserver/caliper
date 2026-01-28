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
            "テキスト分析ツール": "fas fa-chart-pie",
            "テキスト短縮ツール": "fas fa-compress-alt",
            "オンライン単語・文字カウンター": "fas fa-list-ol",
            "テキストフォーマッター": "fas fa-align-justify",
            "重複テキスト削除": "fas fa-clipboard-check",
            "HTMLタグ削除": "fas fa-code",
            "テキストケースコンバーター": "fas fa-text-height",
            "リバーステキストジェネレーター": "fas fa-sync-alt",
            "テキスト行ソート": "fas fa-sort-numeric-down",
            "単語テキストスプリッター": "fas fa-cut",
            "テキストマージャー": "fas fa-file-alt",
            "テキスト文字置換": "fas fa-search",
            "キーワード密度アナライザー": "fas fa-chart-bar",
            "画像コンバーター": "fas fa-exchange-alt",
            "画像リサイザー": "fas fa-expand-arrows-alt",
            "画像コンプレッサー": "fas fa-compress",
            "画像フィルター&エフェクトツール": "fas fa-magic",
            "画像アノテーションツール": "fas fa-pen",
            "画像ピクセル&カラーツール": "fas fa-palette",
            "画像マージ&スプリットツール": "fas fa-object-group",
            "背景&マスクツール": "fas fa-layer-group",
            "画像メタデータ&情報": "fas fa-info-circle",
            "ビデオメタデータビュアー": "fas fa-info-circle",
            "ビデオファイルサイズ計算機": "fas fa-calculator",
            "ビデオ再生時間チェッカー": "fas fa-stopwatch",
            "ビデオMIMEタイプディテクター": "fas fa-magic",
            "ビデオコンテナ情報チェッカー": "fas fa-box-open",
            "ビデオフレームエクストラクター": "fas fa-camera-retro",
            "ビデオサムネイルジェネレーター": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (ja) from path for relative path calculation
    const languageCode = 'ja';
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
                                toolUrl = `${basePath}index.html`;
                            } else {
                                // All tools now use the correct path format, just add basePath
                                toolUrl = `${basePath}${toolUrl}`;
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
                    container.innerHTML = '<p class="text-center text-gray-500">関連するツールが見つかりません。</p>';
                }
            } else {
                console.error('Current tool not found with slug:', currentSlug);
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">関連するツールの読み込みに失敗しました。</p>';
            }
        })
        .catch(error => {
            console.error('Error loading related tools:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">関連するツールの読み込みに失敗しました。</p>';
        });
}

// Export the function for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}