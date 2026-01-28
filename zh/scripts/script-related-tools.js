// 相关工具推荐逻辑
// 此脚本可包含在任何工具页面中，自动显示相关工具

function initRelatedTools(currentSlug) {
    // 检查relatedTools容器是否存在
    const container = document.getElementById('relatedTools');
    if (!container) {
        console.warn('未找到相关工具容器，跳过相关工具初始化');
        return;
    }
    
    // 工具图标映射 - 使用Font Awesome图标代替图片
    // 这应该与script.js中的toolIcons相同，以确保页面间图标的一致性
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
    
    // 根据当前页面位置确定tools.json的正确路径
    // tools.json始终位于网站根目录的data文件夹中
    const pathSegments = window.location.pathname.split('/');
    // 过滤掉空字符串
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // 从路径中移除语言代码(zh)，用于相对路径计算
    const languageCode = 'zh';
    const languageIndex = nonEmptySegments.indexOf(languageCode);
    let relativeSegments = nonEmptySegments;
    
    if (languageIndex !== -1) {
        relativeSegments = nonEmptySegments.slice(languageIndex + 1);
    }
    
    // 计算目录深度 - 排除文件名
    let directoryDepth = 0;
    if (relativeSegments.length > 0) {
        // 如果最后一个段包含扩展名(即文件名)，则减1
        const lastSegment = relativeSegments[relativeSegments.length - 1];
        directoryDepth = lastSegment.includes('.') ? relativeSegments.length - 1 : relativeSegments.length;
    }
    // 根据目录深度计算需要返回的层级数
    const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
    // Detect language from URL (/bn/xxx or /zh/xxx or /en/xxx)
    const langMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
    const lang = langMatch ? langMatch[1] : 'en';
    
    // Load language-specific tools.json
    const toolsJsonPath = `/${lang}/data/tools.json`;
    
    fetch(toolsJsonPath)
        .then(res => res.json())
        .then(tools => {
            console.log('工具已加载:', tools.length);
                console.log('查找slug:', currentSlug);
                const current = tools.find(t => t.slug === currentSlug);
                
                console.log('找到当前工具:', current);
                
                if (current) {
                    console.log('当前工具类别:', current.category);
                    console.log('当前工具标签:', current.tags);
                    
                    const related = tools
                        // 首先确保排除当前工具，无论其他条件如何
                        .filter(t => t.id !== current.id && t.slug !== currentSlug)
                        .map(t => {
                            let score = 0;
                            // 相同类别获得分数
                            if (t.category === current.category) {
                                score += 3;
                                console.log('与', t.name, '相同类别，添加3分');
                            }
                            // 相同标签获得分数
                            t.tags.forEach(tag => {
                                if (current.tags.includes(tag)) {
                                    score += 1;
                                    console.log('与', t.name, '相同标签', tag, '，添加1分');
                                }
                            });
                            // 热度权重
                            score += t.hot_score * 0.001;
                            console.log('工具', t.name, '得分:', score);
                            return { ...t, score };
                        })
                    .filter(t => t.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
                
                console.log('找到相关工具:', related.length);
                
                const container = document.getElementById('relatedTools');
                
                if (related.length > 0) {
                    container.innerHTML = related.map(tool => {
                            // 获取Font Awesome图标类，如果未找到则使用默认图标
                            const iconClass = toolIcons[tool.slug] || "fas fa-tools";
                            
                            // 确定工具的正确URL
                            let toolUrl = tool.url;
                            if (toolUrl === '#') {
                                // 占位符链接指向主页
                                toolUrl = `${basePath}index.html`;
                            } else {
                                // 所有工具现在都使用正确的路径格式，只需添加basePath
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
                    container.innerHTML = '<p class="text-center text-gray-500">未找到相关工具。</p>';
                }
            } else {
                console.error('未找到slug为', currentSlug, '的当前工具');
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">加载相关工具失败。</p>';
            }
        })
        .catch(error => {
            console.error('加载相关工具时出错:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">加载相关工具失败。</p>';
        });
}

// 导出函数供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}