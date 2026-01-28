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
            "Ferramenta de análise de texto": "fas fa-chart-pie",
            "Ferramenta de encurtamento de texto": "fas fa-compress-alt",
            "Contador de palavras e caracteres online": "fas fa-list-ol",
            "Formatador de texto": "fas fa-align-justify",
            "Remoção de texto duplicado": "fas fa-clipboard-check",
            "Remover tags HTML": "fas fa-code",
            "Conversor de maiúsculas/minúsculas de texto": "fas fa-text-height",
            "Gerador de inversão de texto": "fas fa-sync-alt",
            "Ordenar linhas de texto": "fas fa-sort-numeric-down",
            "Divisor de palavras/texto": "fas fa-cut",
            "Ferramenta de mesclagem de texto": "fas fa-file-alt",
            "Substituição de caracteres de texto": "fas fa-search",
            "Analisador de densidade de palavras-chave": "fas fa-chart-bar",
            "Conversor de imagens": "fas fa-exchange-alt",
            "Ferramenta de redimensionamento de imagem": "fas fa-expand-arrows-alt",
            "Ferramenta de compressão de imagem": "fas fa-compress",
            "Ferramenta de filtros e efeitos de imagem": "fas fa-magic",
            "Ferramenta de anotação de imagem": "fas fa-pen",
            "Ferramentas de pixels e cores de imagem": "fas fa-palette",
            "Ferramenta de mesclagem e divisão de imagem": "fas fa-object-group",
            "Ferramenta de fundo e máscara": "fas fa-layer-group",
            "Metadados e informações da imagem": "fas fa-info-circle",
            "Visualizador de metadados de vídeo": "fas fa-info-circle",
            "Calculadora de tamanho de arquivo de vídeo": "fas fa-calculator",
            "Verificador de duração de vídeo": "fas fa-stopwatch",
            "Detector de tipo MIME de vídeo": "fas fa-magic",
            "Verificador de informações do contêiner de vídeo": "fas fa-box-open",
            "Extrator de quadros de vídeo": "fas fa-camera-retro",
            "Gerador de miniatura de vídeo": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (pt) from path for relative path calculation
    const languageCode = 'pt';
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
