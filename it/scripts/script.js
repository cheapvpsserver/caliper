// Tool icon mapping - using Font Awesome icons instead of images
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
    "image-converter": "fas fa-exchange-alt",
    "image-resizer": "fas fa-expand-arrows-alt",
    "image-compressor": "fas fa-compress",
    "image-filters-effects-tool": "fas fa-magic",
    "image-annotation-tool": "fas fa-pen",
    "image-pixel-color-tools": "fas fa-palette",
    "image-merge-split-tool": "fas fa-object-group",
    "image-background-mask-tool": "fas fa-layer-group",
    "image-metadata-tool": "fas fa-info-circle",
    "video-metadata-viewer": "fas fa-info-circle",
    "video-file-size-calculator": "fas fa-calculator",
    "video-duration-checker": "fas fa-stopwatch",
    "video-mime-type-detector": "fas fa-magic",
    "video-container-info-checker": "fas fa-box-open",
    "video-frame-extractor": "fas fa-camera-retro",
    "video-thumbnail-generator": "fas fa-images"
};

// Generate tool card HTML
function generateToolCard(tool) {
    // Get Font Awesome icon class, use default if not found
    const iconClass = toolIcons[tool.slug] || "fas fa-tools";
    
    return `
        <a href="${tool.url}" class="tool-card-link">
            <div class="tool-card">
                <div class="tool-icon">
                    <i class="${iconClass}"></i>
                </div>
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
            </div>
        </a>
    `;
}

// Display popular tools
async function displayPopularTools() {
    try {
        // Determine directory depth of current page relative to it/ directory
        const pathSegments = window.location.pathname.split('/');
        const nonEmptySegments = pathSegments.filter(segment => segment !== '');
        
        // Remove language code (it) from path for relative path calculation
        const languageCode = 'it';
        const languageIndex = nonEmptySegments.indexOf(languageCode);
        let relativeSegments = nonEmptySegments;
        
        if (languageIndex !== -1) {
            relativeSegments = nonEmptySegments.slice(languageIndex + 1);
        }
        
        let directoryDepth = 0;
        if (relativeSegments.length > 0) {
            const lastSegment = relativeSegments[relativeSegments.length - 1];
            directoryDepth = lastSegment.includes('.') ? relativeSegments.length - 1 : relativeSegments.length;
        }
        
        // Calculate base path according to directory depth
        const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
        const toolsJsonPath = `${basePath}data/tools.json`;
        
        // Load tools.json using the calculated path
        const response = await fetch(toolsJsonPath);
        const tools = await response.json();
        
        // Always show top 10 tools by hot_score, regardless of creation date
        const popularTools = tools
            .sort((a, b) => b.hot_score - a.hot_score) // Sort by popularity in descending order
            .slice(0, 10); // Always show top 10
        
        const container = document.getElementById('popularTools');
        container.innerHTML = popularTools.map(generateToolCard).join('');
        
        // Add click event listeners to track tool usage
        addToolClickListeners();
    } catch (error) {
        console.error('Error loading popular tools:', error);
    }
}

// Add click event listeners to tool cards to track usage
function addToolClickListeners() {
    // Get all tool card links
    const toolLinks = document.querySelectorAll('.tool-card-link');
    
    toolLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Extract tool slug from the URL
            const href = this.getAttribute('href');
            const toolSlug = extractToolSlug(href);
            
            if (toolSlug) {
                // Update tool click count and hot score
                updateToolHotScore(toolSlug);
            }
        });
    });
}

// Extract tool slug from URL
function extractToolSlug(url) {
    // Extract slug from URL like "text/text-handling/Free-online-text-analysis-checker.html"
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const slug = filename.replace('.html', '').toLowerCase();
    return slug;
}

// Update tool hot score based on clicks
function updateToolHotScore(toolSlug) {
    // Get current click counts from localStorage
    let clickCounts = JSON.parse(localStorage.getItem('toolClickCounts') || '{}');
    
    // Increment click count for the tool
    clickCounts[toolSlug] = (clickCounts[toolSlug] || 0) + 1;
    
    // Save updated click counts to localStorage
    localStorage.setItem('toolClickCounts', JSON.stringify(clickCounts));
    
    // Note: In a real application, you would also send this data to a server
    // For this implementation, we're just storing locally for demonstration
    console.log(`Tool clicked: ${toolSlug}, Total clicks: ${clickCounts[toolSlug]}`);
}

// Display latest tools
async function displayLatestTools() {
    try {
        // Determine directory depth of current page relative to it/ directory
        const pathSegments = window.location.pathname.split('/');
        const nonEmptySegments = pathSegments.filter(segment => segment !== '');
        
        // Remove language code (it) from path for relative path calculation
        const languageCode = 'it';
        const languageIndex = nonEmptySegments.indexOf(languageCode);
        let relativeSegments = nonEmptySegments;
        
        if (languageIndex !== -1) {
            relativeSegments = nonEmptySegments.slice(languageIndex + 1);
        }
        
        let directoryDepth = 0;
        if (relativeSegments.length > 0) {
            const lastSegment = relativeSegments[relativeSegments.length - 1];
            directoryDepth = lastSegment.includes('.') ? relativeSegments.length - 1 : relativeSegments.length;
        }
        
        // Calculate base path according to directory depth
        const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
        const toolsJsonPath = `${basePath}data/tools.json`;
        
        // Load tools.json using the calculated path
        const response = await fetch(toolsJsonPath);
        const tools = await response.json();
        
        const latestTools = tools
            .sort((a, b) => {
                // First sort by creation time in descending order
                const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
                if (dateDiff !== 0) {
                    return dateDiff;
                }
                // If creation times are the same, sort by id in descending order to ensure the most recently added tools appear first
                return b.id - a.id;
            })
            .slice(0, 10); // Show top 10
        
        const container = document.getElementById('latestTools');
        container.innerHTML = latestTools.map(generateToolCard).join('');
    } catch (error) {
        console.error('Error loading latest tools:', error);
    }
}

// Dynamically load HTML content
async function loadHTML(url, element, position = 'beforeend') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}`);
        }
        const html = await response.text();
        
        if (position === 'prepend') {
            element.insertAdjacentHTML('afterbegin', html);
        } else if (position === 'append') {
            element.insertAdjacentHTML('beforeend', html);
        } else if (position === 'before') {
            element.insertAdjacentHTML('beforebegin', html);
        } else if (position === 'after') {
            element.insertAdjacentHTML('afterend', html);
        }
    } catch (error) {
        console.error('Error loading HTML:', error);
    }
}

// PDF conversion dropdown menu interaction functionality
function setupPdfDropdown() {
    const pdfMenu = document.getElementById('mobile-convert-pdf');
    const pdfSubmenu = document.getElementById('mobile-convert-submenu');
    
    if (pdfMenu && pdfSubmenu) {
        pdfMenu.addEventListener('click', function() {
            // Toggle submenu display state
            if (pdfSubmenu.classList.contains('hidden')) {
                pdfSubmenu.classList.remove('hidden');
            } else {
                pdfSubmenu.classList.add('hidden');
            }
        });
        
        // Hide submenu when clicking elsewhere in the document
        document.addEventListener('click', function(event) {
            if (!pdfMenu.contains(event.target) && !pdfSubmenu.contains(event.target)) {
                pdfSubmenu.classList.add('hidden');
            }
        });
    }
}

// Mobile side menu functionality
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (hamburger && mobileNav && mobileOverlay) {
        // Hamburger menu click event
        hamburger.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            
            // Toggle hamburger menu icon state
            hamburger.classList.toggle('active');
            
            // Toggle nav-open class on body to control page scrolling
            document.body.classList.toggle('nav-open', mobileNav.classList.contains('active'));
        });
        
        // Close menu by clicking on overlay
        mobileOverlay.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            mobileOverlay.classList.remove('active');
            
            // Reset hamburger menu icon state
            hamburger.classList.remove('active');
            
            // Remove nav-open class from body
            document.body.classList.remove('nav-open');
        });
        
        // Close menu by clicking menu items (optional)
        const navLinks = mobileNav.querySelectorAll('.nav-link, .mobile-submenu-item, .donate-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                mobileOverlay.classList.remove('active');
                
                // Reset hamburger menu icon state
                hamburger.classList.remove('active');
                
                // Remove nav-open class from body
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// Mobile PDF conversion dropdown menu interaction functionality
function setupMobilePdfDropdown() {
    const pdfMenu = document.getElementById('mobile-convert-pdf');
    const pdfSubmenu = document.getElementById('mobile-convert-submenu');
    const dropdownArrow = pdfMenu ? pdfMenu.querySelector('.dropdown-arrow') : null;
    
    if (pdfMenu && pdfSubmenu) {
        pdfMenu.addEventListener('click', function() {
            // Toggle submenu display state
            pdfSubmenu.classList.toggle('expanded');
            
            // Rotate arrow icon
            if (dropdownArrow) {
                dropdownArrow.classList.toggle('rotated');
            }
        });
    }
}

// Language switcher functionality
function setupLanguageSwitcher() {
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');
    
    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
                languageDropdown.classList.remove('show');
            }
        });
    }
    
    // Set current language based on URL path
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    const currentLang = langMatch ? langMatch[1] : 'en';
    
    const currentLangEl = document.getElementById('currentLang');
    if (currentLangEl) {
        currentLangEl.textContent = currentLang.toUpperCase();
    }
    
    // Highlight current language in dropdown
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === currentLang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Update language switcher links to maintain current page path
    updateLanguageLinks();
}

// Update language switcher links to maintain current page path
function updateLanguageLinks() {
    const path = window.location.pathname;
    let pagePath = '';
    
    // Extract page path (remove language code if present)
    const langMatch = path.match(/^\/([a-z]{2})\//);
    if (langMatch) {
        // Remove language code from path, ensure it starts with /
        pagePath = path.substring(langMatch[0].length - 1);
    } else {
        pagePath = path;
    }
    
    // Ensure pagePath starts with /
    if (!pagePath.startsWith('/')) {
        pagePath = '/' + pagePath;
    }
    
    // Update desktop language switcher links
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === 'en') {
            option.href = pagePath === '/' || pagePath === '' ? '/' : pagePath;
        } else {
            option.href = '/' + lang + pagePath;
        }
    });
    
    // Update mobile language switcher links
    const mobileLanguageOptions = document.querySelectorAll('.mobile-language-option');
    mobileLanguageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === 'en') {
            option.href = pagePath === '/' || pagePath === '' ? '/' : pagePath;
        } else {
            option.href = '/' + lang + pagePath;
        }
    });
}

// Mobile language switcher functionality
function setupMobileLanguageSwitcher() {
    const mobileLanguageBtn = document.getElementById('mobileLanguageBtn');
    const mobileLanguageDropdown = document.getElementById('mobileLanguageDropdown');
    
    if (mobileLanguageBtn && mobileLanguageDropdown) {
        mobileLanguageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileLanguageDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileLanguageBtn.contains(e.target) && !mobileLanguageDropdown.contains(e.target)) {
                mobileLanguageDropdown.classList.remove('show');
            }
        });
    }
    
    // Set current language based on URL path for mobile
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    const currentLang = langMatch ? langMatch[1] : 'en';
    
    const mobileCurrentLangEl = document.getElementById('mobileCurrentLang');
    if (mobileCurrentLangEl) {
        mobileCurrentLangEl.textContent = currentLang.toUpperCase();
    }
    
    // Highlight current language in mobile dropdown
    const mobileLanguageOptions = document.querySelectorAll('.mobile-language-option');
    mobileLanguageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === currentLang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Execute after page load
document.addEventListener('DOMContentLoaded', async function() {
    // Save current scroll position
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    
    // Determine the directory depth of the current page relative to the it/ directory
    const pathSegments = window.location.pathname.split('/');
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Remove language code (it) from the path for relative path calculation
    const languageCode = 'it';
    const languageIndex = nonEmptySegments.indexOf(languageCode);
    let relativeSegments = nonEmptySegments;
    
    if (languageIndex !== -1) {
        relativeSegments = nonEmptySegments.slice(languageIndex + 1);
    }
    
    let directoryDepth = 0;
    if (relativeSegments.length > 0) {
        const lastSegment = relativeSegments[relativeSegments.length - 1];
        directoryDepth = lastSegment.includes('.') ? relativeSegments.length - 1 : relativeSegments.length;
    }
    
    // Detect language from URL (/zh/xxx or /en/xxx)
    const langMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
    const lang = langMatch ? langMatch[1] : 'en';
    
    // Load header (language-specific)
    await loadHTML(`/${lang}/header.html`, document.body, 'prepend');
    
    // Load footer (language-specific)
    const mainElement = document.querySelector('main');
    if (mainElement) {
        await loadHTML(`/${lang}/footer.html`, mainElement, 'after');
    }
    
    // Only load tool list on homepage or pages containing the corresponding container
    const popularToolsContainer = document.getElementById('popularTools');
    if (popularToolsContainer) {
        await displayPopularTools();
    }
    
    const latestToolsContainer = document.getElementById('latestTools');
    if (latestToolsContainer) {
        await displayLatestTools();
    }
    
    // Set up PDF conversion dropdown menu
    setupPdfDropdown();
    
    // Set up mobile menu
    setupMobileMenu();
    
    // Set up mobile PDF conversion dropdown menu
    setupMobilePdfDropdown();
    
    // Set up language switcher
    setupLanguageSwitcher();
    
    // Set up mobile language switcher
    setupMobileLanguageSwitcher();
    
    // Mark content as loaded, remove flashing overlay
    document.body.classList.add('content-loaded');
});

// Listen for page scroll, save scroll position
window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('scrollPosition', window.scrollY);
});

// Function to fix link paths in multilingual site
function fixLinkPaths() {
    // Handle anchor links that should go to the main list page
    // Using delegation to handle dynamically added elements
    document.addEventListener('click', function(event) {
        // Find the closest anchor element regardless of when it was added to DOM
        const target = event.target.closest('a[href]');
        if (target) {
            const href = target.getAttribute('href');
            
            // Skip language switcher links (those with data-lang attribute)
            if (target.hasAttribute('data-lang')) {
                return;
            }
            
            // Check if we're on a Italian language page
            const isItalianPage = window.location.pathname.includes('/it/');
            
            if (isItalianPage) {
                // Skip main site link
                if (href === '/') {
                    return;
                }
                // Handle absolute root links that should be prefixed with /it/
                if (href.startsWith('/') && !href.startsWith('/it/')) {
                    event.preventDefault();
                    const newPath = window.location.origin + '/it' + href;
                    window.location.href = newPath;
                }
                // Handle links like /list.html#text-tools that should become /it/list.html#text-tools
                else if (href.startsWith('/list.html#') && !href.startsWith('/it/list.html#')) {
                    event.preventDefault();
                    const newPath = window.location.origin + '/it' + href;
                    window.location.href = newPath;
                }
                // Skip processing for internal anchors (those that start with # but are not actual URLs)
                // We don't want to redirect internal page anchors like #tutorial
                else if (href.startsWith('#') && !href.startsWith('#/')) {
                    // Allow default behavior for internal anchors
                    return;
                }
            }
        }
    });
}

// Add smooth scrolling effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Call the link path fix function
fixLinkPaths();