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
            "텍스트 분석 도구": "fas fa-chart-pie",
            "텍스트 단축 도구": "fas fa-compress-alt",
            "온라인 단어 및 문자 카운터": "fas fa-list-ol",
            "텍스트 포매터": "fas fa-align-justify",
            "중복 텍스트 제거": "fas fa-clipboard-check",
            "HTML 태그 제거": "fas fa-code",
            "텍스트 대소문자 변환기": "fas fa-text-height",
            "리버스 텍스트 생성기": "fas fa-sync-alt",
            "텍스트 줄 정렬": "fas fa-sort-numeric-down",
            "단어 텍스트 스플리터": "fas fa-cut",
            "텍스트 머지 도구": "fas fa-file-alt",
            "텍스트 문자 교체": "fas fa-search",
            "키워드 밀도 분석기": "fas fa-chart-bar",
            "이미지 변환기": "fas fa-exchange-alt",
            "이미지 리사이저": "fas fa-expand-arrows-alt",
            "이미지 압축기": "fas fa-compress",
            "이미지 필터 및 효과 도구": "fas fa-magic",
            "이미지 주석 도구": "fas fa-pen",
            "이미지 픽셀 및 색상 도구": "fas fa-palette",
            "이미지 병합 및 분할 도구": "fas fa-object-group",
            "배경 및 마스크 도구": "fas fa-layer-group",
            "이미지 메타데이터 및 정보": "fas fa-info-circle",
            "비디오 메타데이터 뷰어": "fas fa-info-circle",
            "비디오 파일 크기 계산기": "fas fa-calculator",
            "비디오 재생 시간 체커": "fas fa-stopwatch",
            "비디오 MIME 유형 감지기": "fas fa-magic",
            "비디오 컨테이너 정보 체커": "fas fa-box-open",
            "비디오 프레임 추출기": "fas fa-camera-retro",
            "비디오 썸네일 생성기": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (ko) from path for relative path calculation
    const languageCode = 'ko';
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
                    container.innerHTML = '<p class="text-center text-gray-500">관련된 도구를 찾을 수 없습니다.</p>';
                }
            } else {
                console.error('Current tool not found with slug:', currentSlug);
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">관련 도구를 불러오지 못했습니다.</p>';
            }
        })
        .catch(error => {
            console.error('관련 도구 로딩 중 오류 발생:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">관련 도구를 불러오지 못했습니다.</p>';
        });
}

// Export the function for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}
