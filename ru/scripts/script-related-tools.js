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
            "Текстовый анализатор": "fas fa-chart-pie",
            "Сокращение текста": "fas fa-compress-alt",
            "Подсчет слов и символов онлайн": "fas fa-list-ol",
            "Форматирование текста": "fas fa-align-justify",
            "Удаление дублированного текста": "fas fa-clipboard-check",
            "Удаление HTML-тегов": "fas fa-code",
            "Преобразование регистра текста": "fas fa-text-height",
            "Генератор обратного текста": "fas fa-sync-alt",
            "Сортировка текстовых строк": "fas fa-sort-numeric-down",
            "Разделитель слов и текста": "fas fa-cut",
            "Объединение текста": "fas fa-file-alt",
            "Замена символов в тексте": "fas fa-search",
            "Анализатор плотности ключевых слов": "fas fa-chart-bar",
            "Конвертер изображений": "fas fa-exchange-alt",
            "Изменение размера изображения": "fas fa-expand-arrows-alt",
            "Сжатие изображений": "fas fa-compress",
            "Фильтры и эффекты для изображений": "fas fa-magic",
            "Инструмент аннотирования изображений": "fas fa-pen",
            "Пиксельные и цветовые инструменты": "fas fa-palette",
            "Объединение и разделение изображений": "fas fa-object-group",
            "Фон и инструмент маскирования": "fas fa-layer-group",
            "Метаданные и информация об изображении": "fas fa-info-circle",
            "Просмотрщик метаданных видео": "fas fa-info-circle",
            "Калькулятор размера видеофайла": "fas fa-calculator",
            "Проверка длительности видео": "fas fa-stopwatch",
            "Определитель типа MIME видео": "fas fa-magic",
            "Проверка информации о контейнере видео": "fas fa-box-open",
            "Извлечение кадров видео": "fas fa-camera-retro",
            "Генератор миниатюр видео": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (de) from path for relative path calculation
    const languageCode = 'ru';
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