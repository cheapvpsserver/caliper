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
            "Strumento di analisi del testo": "fas fa-chart-pie",
            "Strumento di abbreviazione del testo": "fas fa-compress-alt",
            "Contatore di parole e caratteri online": "fas fa-list-ol",
            "Formattatore di testo": "fas fa-align-justify",
            "Rimozione del testo duplicato": "fas fa-clipboard-check",
            "Rimuovi tag HTML": "fas fa-code",
            "Convertitore di maiuscole/minuscole del testo": "fas fa-text-height",
            "Generatore di inversione del testo": "fas fa-sync-alt",
            "Ordina righe di testo": "fas fa-sort-numeric-down",
            "Separatore di parole/testo": "fas fa-cut",
            "Strumento di unione del testo": "fas fa-file-alt",
            "Sostituzione di caratteri del testo": "fas fa-search",
            "Analizzatore di densità delle parole chiave": "fas fa-chart-bar",
            "Convertitore di immagini": "fas fa-exchange-alt",
            "Strumento di ridimensionamento delle immagini": "fas fa-expand-arrows-alt",
            "Strumento di compressione delle immagini": "fas fa-compress",
            "Strumento di filtri ed effetti per immagini": "fas fa-magic",
            "Strumento di annotazione delle immagini": "fas fa-pen",
            "Strumenti di pixel e colore dell'immagine": "fas fa-palette",
            "Strumento di unione e divisione delle immagini": "fas fa-object-group",
            "Strumento di sfondo e maschera": "fas fa-layer-group",
            "Metadati e informazioni sull'immagine": "fas fa-info-circle",
            "Visualizzatore di metadati video": "fas fa-info-circle",
            "Calcolatore dimensione file video": "fas fa-calculator",
            "Controllo durata video": "fas fa-stopwatch",
            "Rilevatore tipo MIME video": "fas fa-magic",
            "Controllo informazioni contenitore video": "fas fa-box-open",
            "Estrattore frame video": "fas fa-camera-retro",
            "Generatore miniatura video": "fas fa-images"
        };
    
    // Determine the correct path to tools.json based on the current page location
    // tools.json is always in the data folder at the root of the website
    const pathSegments = window.location.pathname.split('/');
    // Filter out empty strings
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (it) from path for relative path calculation
    const languageCode = 'it';
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