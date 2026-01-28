// टूल आइकन मैपिंग - छवियों के बजाय Font Awesome आइकन का उपयोग कर रहे हैं
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

// टूल कार्ड HTML जनरेट करें
function generateToolCard(tool) {
    // Font Awesome आइकन क्लास प्राप्त करें, यदि नहीं मिलता तो डिफ़ॉल्ट का उपयोग करें
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

// लोकप्रिय टूल्स प्रदर्शित करें
async function displayPopularTools() {
    try {
        // hi/ निर्देशिका के सापेक्ष वर्तमान पृष्ठ की निर्देशिका गहराई निर्धारित करें
        const pathSegments = window.location.pathname.split('/');
        const nonEmptySegments = pathSegments.filter(segment => segment !== '');
        
        // सापेक्ष पथ गणना के लिए पथ से भाषा कोड (hi) निकालें
        const languageCode = 'hi';
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
        
        // निर्देशिका गहराई के अनुसार आधार पथ गणना करें
        const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
        const toolsJsonPath = `${basePath}data/tools.json`;
        
        // गणना किए गए पथ का उपयोग करके tools.json लोड करें
        const response = await fetch(toolsJsonPath);
        const tools = await response.json();
        
        // निर्माण तिथि की परवाह किए बिना, हमेशा hot_score के आधार पर शीर्ष 10 टूल्स दिखाएं
        const popularTools = tools
            .sort((a, b) => b.hot_score - a.hot_score) // लोकप्रियता के अनुसार अवरोही क्रम में क्रमबद्ध करें
            .slice(0, 10); // हमेशा शीर्ष 10 दिखाएं
        
        const container = document.getElementById('popularTools');
        container.innerHTML = popularTools.map(generateToolCard).join('');
        
        // टूल उपयोग को ट्रैक करने के लिए क्लिक इवेंट लिसनर्स जोड़ें
        addToolClickListeners();
    } catch (error) {
        console.error('लोकप्रिय टूल्स लोड करने में त्रुटि:', error);
    }
}

// टूल उपयोग को ट्रैक करने के लिए टूल कार्ड में क्लिक इवेंट लिसनर्स जोड़ें
function addToolClickListeners() {
    // सभी टूल कार्ड लिंक प्राप्त करें
    const toolLinks = document.querySelectorAll('.tool-card-link');
    
    toolLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // URL से टूल स्लग निकालें
            const href = this.getAttribute('href');
            const toolSlug = extractToolSlug(href);
            
            if (toolSlug) {
                // टूल क्लिक संख्या और हॉट स्कोर अपडेट करें
                updateToolHotScore(toolSlug);
            }
        });
    });
}

// URL से टूल स्लग निकालें
function extractToolSlug(url) {
    // URL से स्लग निकालें जैसे "text/text-handling/Free-online-text-analysis-checker.html"
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const slug = filename.replace('.html', '').toLowerCase();
    return slug;
}

// क्लिक्स के आधार पर टूल हॉट स्कोर अपडेट करें
function updateToolHotScore(toolSlug) {
    // localStorage से वर्तमान क्लिक संख्याएं प्राप्त करें
    let clickCounts = JSON.parse(localStorage.getItem('toolClickCounts') || '{}');
    
    // टूल के लिए क्लिक संख्या बढ़ाएं
    clickCounts[toolSlug] = (clickCounts[toolSlug] || 0) + 1;
    
    // अपडेट की गई क्लिक संख्याओं को localStorage में सहेजें
    localStorage.setItem('toolClickCounts', JSON.stringify(clickCounts));
    
    // नोट: वास्तविक एप्लिकेशन में, आप इस डेटा को सर्वर पर भी भेजेंगे
    // इस कार्यान्वयन के लिए, हम केवल प्रदर्शन के लिए स्थानीय रूप से स्टोर कर रहे हैं
    console.log(`टूल क्लिक किया: ${toolSlug}, कुल क्लिक्स: ${clickCounts[toolSlug]}`);
}

// नवीनतम टूल्स प्रदर्शित करें
async function displayLatestTools() {
    try {
        // hi/ निर्देशिका के सापेक्ष वर्तमान पृष्ठ की निर्देशिका गहराई निर्धारित करें
        const pathSegments = window.location.pathname.split('/');
        const nonEmptySegments = pathSegments.filter(segment => segment !== '');
        
        // सापेक्ष पथ गणना के लिए पथ से भाषा कोड (hi) निकालें
        const languageCode = 'hi';
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
        
        // निर्देशिका गहराई के अनुसार आधार पथ गणना करें
        const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
        const toolsJsonPath = `${basePath}data/tools.json`;
        
        // गणना किए गए पथ का उपयोग करके tools.json लोड करें
        const response = await fetch(toolsJsonPath);
        const tools = await response.json();
        
        const latestTools = tools
            .sort((a, b) => {
                // पहले निर्माण समय के अनुसार अवरोही क्रम में क्रमबद्ध करें
                const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
                if (dateDiff !== 0) {
                    return dateDiff;
                }
                // यदि निर्माण समय समान हैं, तो अधिक हाल ही में जोड़े गए टूल्स पहले दिखाने के लिए id के अनुसार अवरोही क्रम में क्रमबद्ध करें
                return b.id - a.id;
            })
            .slice(0, 10); // शीर्ष 10 दिखाएं
        
        const container = document.getElementById('latestTools');
        container.innerHTML = latestTools.map(generateToolCard).join('');
    } catch (error) {
        console.error('नवीनतम टूल्स लोड करने में त्रुटि:', error);
    }
}

// HTML सामग्री को गतिशील रूप से लोड करें
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
        console.error('HTML लोड करने में त्रुटि:', error);
    }
}

// PDF रूपांतरण ड्रॉपडाउन मेनू इंटरैक्शन कार्यक्षमता
function setupPdfDropdown() {
    const pdfMenu = document.getElementById('mobile-convert-pdf');
    const pdfSubmenu = document.getElementById('mobile-convert-submenu');
    
    if (pdfMenu && pdfSubmenu) {
        pdfMenu.addEventListener('click', function() {
            // सबमेनू प्रदर्शन स्थिति को टॉगल करें
            if (pdfSubmenu.classList.contains('hidden')) {
                pdfSubmenu.classList.remove('hidden');
            } else {
                pdfSubmenu.classList.add('hidden');
            }
        });
        
        // दस्तावेज़ में कहीं और क्लिक करने पर सबमेनू छिपाएं
        document.addEventListener('click', function(event) {
            if (!pdfMenu.contains(event.target) && !pdfSubmenu.contains(event.target)) {
                pdfSubmenu.classList.add('hidden');
            }
        });
    }
}

// मोबाइल साइड मेनू कार्यक्षमता
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (hamburger && mobileNav && mobileOverlay) {
        // हैमबर्गर मेनू क्लिक इवेंट
        hamburger.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            
            // हैमबर्गर मेनू आइकन स्थिति को टॉगल करें
            hamburger.classList.toggle('active');
            
            // पृष्ठ स्क्रॉल को नियंत्रित करने के लिए body पर nav-open वर्ग को टॉगल करें
            document.body.classList.toggle('nav-open', mobileNav.classList.contains('active'));
        });
        
        // ओवरले पर क्लिक करके मेनू बंद करें
        mobileOverlay.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            mobileOverlay.classList.remove('active');
            
            // हैमबर्गर मेनू आइकन स्थिति को रीसेट करें
            hamburger.classList.remove('active');
            
            // body से nav-open वर्ग हटाएं
            document.body.classList.remove('nav-open');
        });
        
        // मेनू आइटम्स पर क्लिक करके मेनू बंद करें (वैकल्पिक)
        const navLinks = mobileNav.querySelectorAll('.nav-link, .mobile-submenu-item, .donate-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                mobileOverlay.classList.remove('active');
                
                // हैमबर्गर मेनू आइकन स्थिति को रीसेट करें
                hamburger.classList.remove('active');
                
                // body से nav-open वर्ग हटाएं
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// मोबाइल PDF रूपांतरण ड्रॉपडाउन मेनू इंटरैक्शन कार्यक्षमता
function setupMobilePdfDropdown() {
    const pdfMenu = document.getElementById('mobile-convert-pdf');
    const pdfSubmenu = document.getElementById('mobile-convert-submenu');
    const dropdownArrow = pdfMenu ? pdfMenu.querySelector('.dropdown-arrow') : null;
    
    if (pdfMenu && pdfSubmenu) {
        pdfMenu.addEventListener('click', function() {
            // सबमेनू प्रदर्शन स्थिति को टॉगल करें
            pdfSubmenu.classList.toggle('expanded');
            
            // तीर आइकन को घुमाएं
            if (dropdownArrow) {
                dropdownArrow.classList.toggle('rotated');
            }
        });
    }
}

// भाषा स्विचर कार्यक्षमता
function setupLanguageSwitcher() {
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');
    
    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });
        
        // बाहर क्लिक करने पर ड्रॉपडाउन बंद करें
        document.addEventListener('click', function(e) {
            if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
                languageDropdown.classList.remove('show');
            }
        });
    }
    
    // URL पथ के आधार पर वर्तमान भाषा सेट करें
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    const currentLang = langMatch ? langMatch[1] : 'en';
    
    const currentLangEl = document.getElementById('currentLang');
    if (currentLangEl) {
        currentLangEl.textContent = currentLang.toUpperCase();
    }
    
    // ड्रॉपडाउन में वर्तमान भाषा को हाइलाइट करें
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === currentLang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // वर्तमान पृष्ठ पथ को बनाए रखने के लिए भाषा स्विचर लिंक अपडेट करें
    updateLanguageLinks();
}

// वर्तमान पृष्ठ पथ को बनाए रखने के लिए भाषा स्विचर लिंक अपडेट करें
function updateLanguageLinks() {
    const path = window.location.pathname;
    let pagePath = '';
    
    // पृष्ठ पथ निकालें (यदि मौजूद हो तो भाषा कोड हटाएं)
    const langMatch = path.match(/^\/([a-z]{2})\//);
    if (langMatch) {
        // पथ से भाषा कोड हटाएं, सुनिश्चित करें कि यह / से शुरू होता है
        pagePath = path.substring(langMatch[0].length - 1);
    } else {
        pagePath = path;
    }
    
    // सुनिश्चित करें कि pagePath / से शुरू होता है
    if (!pagePath.startsWith('/')) {
        pagePath = '/' + pagePath;
    }
    
    // डेस्कटॉप भाषा स्विचर लिंक अपडेट करें
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === 'en') {
            option.href = pagePath === '/' || pagePath === '' ? '/' : pagePath;
        } else {
            option.href = '/' + lang + pagePath;
        }
    });
    
    // मोबाइल भाषा स्विचर लिंक अपडेट करें
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

// मोबाइल भाषा स्विचर कार्यक्षमता
function setupMobileLanguageSwitcher() {
    const mobileLanguageBtn = document.getElementById('mobileLanguageBtn');
    const mobileLanguageDropdown = document.getElementById('mobileLanguageDropdown');
    
    if (mobileLanguageBtn && mobileLanguageDropdown) {
        mobileLanguageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileLanguageDropdown.classList.toggle('show');
        });
        
        // बाहर क्लिक करने पर ड्रॉपडाउन बंद करें
        document.addEventListener('click', function(e) {
            if (!mobileLanguageBtn.contains(e.target) && !mobileLanguageDropdown.contains(e.target)) {
                mobileLanguageDropdown.classList.remove('show');
            }
        });
    }
    
    // मोबाइल के लिए URL पथ के आधार पर वर्तमान भाषा सेट करें
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    const currentLang = langMatch ? langMatch[1] : 'en';
    
    const mobileCurrentLangEl = document.getElementById('mobileCurrentLang');
    if (mobileCurrentLangEl) {
        mobileCurrentLangEl.textContent = currentLang.toUpperCase();
    }
    
    // मोबाइल ड्रॉपडाउन में वर्तमान भाषा को हाइलाइट करें
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

// पृष्ठ लोड होने के बाद निष्पादित करें
document.addEventListener('DOMContentLoaded', async function() {
    // वर्तमान स्क्रॉल स्थिति सहेजें
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    
    // hi/ निर्देशिका के सापेक्ष वर्तमान पृष्ठ की निर्देशिका गहराई निर्धारित करें
    const pathSegments = window.location.pathname.split('/');
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // सापेक्ष पथ गणना के लिए पथ से भाषा कोड (hi) हटाएं
    const languageCode = 'hi';
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
    const mainElement = document.querySelector('main.main');
    if (mainElement) {
        await loadHTML(`/${lang}/footer.html`, mainElement, 'after');
    }
    
    // केवल होमपेज या संबंधित कंटेनर वाले पृष्ठों पर टूल सूची लोड करें
    const popularToolsContainer = document.getElementById('popularTools');
    if (popularToolsContainer) {
        await displayPopularTools();
    }
    
    const latestToolsContainer = document.getElementById('latestTools');
    if (latestToolsContainer) {
        await displayLatestTools();
    }
    
    // PDF रूपांतरण ड्रॉपडाउन मेनू सेट अप करें
    setupPdfDropdown();
    
    // मोबाइल मेनू सेट अप करें
    setupMobileMenu();
    
    // मोबाइल PDF रूपांतरण ड्रॉपडाउन मेनू सेट अप करें
    setupMobilePdfDropdown();
    
    // भाषा स्विचर सेट अप करें
    setupLanguageSwitcher();
    
    // मोबाइल भाषा स्विचर सेट अप करें
    setupMobileLanguageSwitcher();
    
    // वर्तमान पृष्ठ पथ को बनाए रखने के लिए भाषा स्विचर लिंक अपडेट करें
    updateLanguageLinks();
    
    // सामग्री को लोड किए गए रूप में चिह्नित करें, फ्लैशिंग ओवरले को हटाएं
    document.body.classList.add('content-loaded');
});

// पृष्ठ स्क्रॉल के लिए सुनें, स्क्रॉल स्थिति सहेजें
window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('scrollPosition', window.scrollY);
});

// बहुभाषी साइट में लिंक पथ्स को ठीक करने के लिए फ़ंक्शन
function fixLinkPaths() {
    // मुख्य सूची पृष्ठ पर जाने वाले एंकर लिंक्स को संभालें
    // गतिशील रूप से जोड़े गए तत्वों को संभालने के लिए डीलीगेशन का उपयोग करें
    document.addEventListener('click', function(event) {
        // DOM में जोड़े गए समय की परवाह किए बिना निकटतम एंकर तत्व को खोजें
        const target = event.target.closest('a[href]');
        if (target) {
            const href = target.getAttribute('href');
            
            // भाषा स्विचर लिंक्स को छोड़ें (जिनमें data-lang विशेषता है)
            if (target.hasAttribute('data-lang')) {
                return;
            }
            
            // जांच करें कि हम हिंदी भाषा के पृष्ठ पर हैं
            const isHindiPage = window.location.pathname.includes('/hi/');
            
            if (isHindiPage) {
                // मुख्य साइट लिंक को छोड़ें
                if (href === '/') {
                    return;
                }
                // पूर्ण रूट लिंक्स को संभालें जिन्हें /hi/ के साथ उपसर्गित किया जाना चाहिए
                if (href.startsWith('/') && !href.startsWith('/hi/')) {
                    event.preventDefault();
                    const newPath = window.location.origin + '/hi' + href;
                    window.location.href = newPath;
                }
                // /list.html#text-tools जैसे लिंक्स को संभालें जो /hi/list.html#text-tools बनने चाहिए
                else if (href.startsWith('/list.html#') && !href.startsWith('/hi/list.html#')) {
                    event.preventDefault();
                    const newPath = window.location.origin + '/hi' + href;
                    window.location.href = newPath;
                }
                // आंतरिक एंकर्स (जो # से शुरू होते हैं लेकिन वास्तविक URL नहीं हैं) के लिए प्रसंस्करण छोड़ें
                // हम आंतरिक पृष्ठ एंकर्स जैसे #tutorial को रीडायरेक्ट नहीं करना चाहते
                else if (href.startsWith('#') && !href.startsWith('#/')) {
                    // आंतरिक एंकर्स के लिए डिफ़ॉल्ट व्यवहार की अनुमति दें
                    return;
                }
            }
        }
    });
}

// चिकनी स्क्रॉलिंग प्रभाव जोड़ें
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

// लिंक पथ फिक्स फ़ंक्शन को कॉल करें
fixLinkPaths();