// Pemetaan ikon alat - menggunakan ikon Font Awesome sebagai ganti gambar
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

// Hasilkan kartu alat HTML
function generateToolCard(tool) {
    // Dapatkan kelas ikon Font Awesome, gunakan default jika tidak ditemukan
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

// Tampilkan alat populer
async function displayPopularTools() {
    try {
        // Tentukan kedalaman direktori halaman saat ini relatif terhadap direktori id/
        const pathSegments = window.location.pathname.split('/');
        const nonEmptySegments = pathSegments.filter(segment => segment !== '');
        
        // Hapus kode bahasa (id) dari path untuk perhitungan path relatif
        const languageCode = 'id';
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
        
        // Hitung path dasar sesuai dengan kedalaman direktori
        const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
        const toolsJsonPath = `${basePath}data/tools.json`;
        
        // Muat tools.json menggunakan path yang dihitung
        const response = await fetch(toolsJsonPath);
        const tools = await response.json();
        
        // Selalu tampilkan 10 alat teratas berdasarkan hot_score, terlepas dari tanggal pembuatan
        const popularTools = tools
            .sort((a, b) => b.hot_score - a.hot_score) // Urutkan berdasarkan popularitas secara menurun
            .slice(0, 10); // Selalu tampilkan 10 teratas
        
        const container = document.getElementById('popularTools');
        container.innerHTML = popularTools.map(generateToolCard).join('');
        
        // Tambahkan pendengar klik untuk melacak penggunaan alat
        addToolClickListeners();
    } catch (error) {
        console.error('Kesalahan memuat alat populer:', error);
    }
}

// Tambahkan pendengar klik ke kartu alat untuk melacak penggunaan
function addToolClickListeners() {
    // Dapatkan semua tautan kartu alat
    const toolLinks = document.querySelectorAll('.tool-card-link');
    
    toolLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Ekstrak slug alat dari URL
            const href = this.getAttribute('href');
            const toolSlug = extractToolSlug(href);
            
            if (toolSlug) {
                // Perbarui jumlah klik dan skor panas alat
                updateToolHotScore(toolSlug);
            }
        });
    });
}

// Ekstrak slug alat dari URL
function extractToolSlug(url) {
    // Ekstrak slug dari URL seperti "text/text-handling/Free-online-text-analysis-checker.html"
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const slug = filename.replace('.html', '').toLowerCase();
    return slug;
}

// Perbarui skor panas alat berdasarkan klik
function updateToolHotScore(toolSlug) {
    // Dapatkan jumlah klik saat ini dari localStorage
    let clickCounts = JSON.parse(localStorage.getItem('toolClickCounts') || '{}');
    
    // Tingkatkan jumlah klik untuk alat tersebut
    clickCounts[toolSlug] = (clickCounts[toolSlug] || 0) + 1;
    
    // Simpan jumlah klik yang diperbarui ke localStorage
    localStorage.setItem('toolClickCounts', JSON.stringify(clickCounts));
    
    // Catatan: Dalam aplikasi nyata, Anda juga akan mengirim data ini ke server
    // Untuk implementasi ini, kami hanya menyimpan secara lokal untuk demonstrasi
    console.log(`Alat diklik: ${toolSlug}, Total klik: ${clickCounts[toolSlug]}`);
}

// Tampilkan alat terbaru
async function displayLatestTools() {
    try {
        // Tentukan kedalaman direktori halaman saat ini relatif terhadap direktori id/
        const pathSegments = window.location.pathname.split('/');
        const nonEmptySegments = pathSegments.filter(segment => segment !== '');
        
        // Hapus kode bahasa (id) dari path untuk perhitungan path relatif
        const languageCode = 'id';
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
        
        // Hitung path dasar sesuai dengan kedalaman direktori
        const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
        const toolsJsonPath = `${basePath}data/tools.json`;
        
        // Muat tools.json menggunakan path yang dihitung
        const response = await fetch(toolsJsonPath);
        const tools = await response.json();
        
        const latestTools = tools
            .sort((a, b) => {
                // Pertama urutkan berdasarkan waktu pembuatan secara menurun
                const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
                if (dateDiff !== 0) {
                    return dateDiff;
                }
                // Jika waktu pembuatan sama, urutkan berdasarkan id secara menurun untuk memastikan alat yang baru ditambahkan muncul pertama kali
                return b.id - a.id;
            })
            .slice(0, 10); // Tampilkan 10 teratas
        
        const container = document.getElementById('latestTools');
        container.innerHTML = latestTools.map(generateToolCard).join('');
    } catch (error) {
        console.error('Kesalahan memuat alat terbaru:', error);
    }
}

// Muat konten HTML secara dinamis
async function loadHTML(url, element, position = 'beforeend') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Gagal memuat ${url}`);
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
        console.error('Kesalahan memuat HTML:', error);
    }
}

// Fungsi interaksi menu tarik-turun konversi PDF
function setupPdfDropdown() {
    const pdfMenu = document.getElementById('mobile-convert-pdf');
    const pdfSubmenu = document.getElementById('mobile-convert-submenu');
    
    if (pdfMenu && pdfSubmenu) {
        pdfMenu.addEventListener('click', function() {
            // Alihkan status tampilan submenu
            if (pdfSubmenu.classList.contains('hidden')) {
                pdfSubmenu.classList.remove('hidden');
            } else {
                pdfSubmenu.classList.add('hidden');
            }
        });
        
        // Sembunyikan submenu ketika mengklik tempat lain dalam dokumen
        document.addEventListener('click', function(event) {
            if (!pdfMenu.contains(event.target) && !pdfSubmenu.contains(event.target)) {
                pdfSubmenu.classList.add('hidden');
            }
        });
    }
}

// Fungsi menu sisi mobile
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (hamburger && mobileNav && mobileOverlay) {
        // Event klik menu hamburger
        hamburger.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            
            // Alihkan status ikon menu hamburger
            hamburger.classList.toggle('active');
            
            // Alihkan kelas nav-open pada body untuk mengontrol pengguliran halaman
            document.body.classList.toggle('nav-open', mobileNav.classList.contains('active'));
        });
        
        // Tutup menu dengan mengklik overlay
        mobileOverlay.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            mobileOverlay.classList.remove('active');
            
            // Atur ulang status ikon menu hamburger
            hamburger.classList.remove('active');
            
            // Hapus kelas nav-open dari body
            document.body.classList.remove('nav-open');
        });
        
        // Tutup menu dengan mengklik item menu (opsional)
        const navLinks = mobileNav.querySelectorAll('.nav-link, .mobile-submenu-item, .donate-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                mobileOverlay.classList.remove('active');
                
                // Atur ulang status ikon menu hamburger
                hamburger.classList.remove('active');
                
                // Hapus kelas nav-open dari body
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// Fungsi interaksi menu tarik-turun konversi PDF mobile
function setupMobilePdfDropdown() {
    const pdfMenu = document.getElementById('mobile-convert-pdf');
    const pdfSubmenu = document.getElementById('mobile-convert-submenu');
    const dropdownArrow = pdfMenu ? pdfMenu.querySelector('.dropdown-arrow') : null;
    
    if (pdfMenu && pdfSubmenu) {
        pdfMenu.addEventListener('click', function() {
            // Alihkan status tampilan submenu
            pdfSubmenu.classList.toggle('expanded');
            
            // Putar ikon panah
            if (dropdownArrow) {
                dropdownArrow.classList.toggle('rotated');
            }
        });
    }
}

// Fungsi pengalih bahasa
function setupLanguageSwitcher() {
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');
    
    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });
        
        // Tutup dropdown ketika mengklik di luar
        document.addEventListener('click', function(e) {
            if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
                languageDropdown.classList.remove('show');
            }
        });
    }
    
    // Tetapkan bahasa saat ini berdasarkan path URL
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    const currentLang = langMatch ? langMatch[1] : 'en';
    
    const currentLangEl = document.getElementById('currentLang');
    if (currentLangEl) {
        currentLangEl.textContent = currentLang.toUpperCase();
    }
    
    // Sorot bahasa saat ini di dropdown
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === currentLang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Perbarui tautan pengalih bahasa untuk menjaga path halaman saat ini
    updateLanguageLinks();
}

// Perbarui tautan pengalih bahasa untuk menjaga path halaman saat ini
function updateLanguageLinks() {
    const path = window.location.pathname;
    let pagePath = '';
    
    // Ekstrak path halaman (hapus kode bahasa jika ada)
    const langMatch = path.match(/^\/([a-z]{2})\//);
    if (langMatch) {
        // Hapus kode bahasa dari path, pastikan dimulai dengan /
        pagePath = path.substring(langMatch[0].length - 1);
    } else {
        pagePath = path;
    }
    
    // Pastikan pagePath dimulai dengan /
    if (!pagePath.startsWith('/')) {
        pagePath = '/' + pagePath;
    }
    
    // Perbarui tautan pengalih bahasa desktop
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === 'en') {
            option.href = pagePath === '/' || pagePath === '' ? '/' : pagePath;
        } else {
            option.href = '/' + lang + pagePath;
        }
    });
    
    // Perbarui tautan pengalih bahasa mobile
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

// Fungsi pengalih bahasa mobile
function setupMobileLanguageSwitcher() {
    const mobileLanguageBtn = document.getElementById('mobileLanguageBtn');
    const mobileLanguageDropdown = document.getElementById('mobileLanguageDropdown');
    
    if (mobileLanguageBtn && mobileLanguageDropdown) {
        mobileLanguageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileLanguageDropdown.classList.toggle('show');
        });
        
        // Tutup dropdown ketika mengklik di luar
        document.addEventListener('click', function(e) {
            if (!mobileLanguageBtn.contains(e.target) && !mobileLanguageDropdown.contains(e.target)) {
                mobileLanguageDropdown.classList.remove('show');
            }
        });
    }
    
    // Tetapkan bahasa saat ini berdasarkan path URL untuk mobile
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    const currentLang = langMatch ? langMatch[1] : 'en';
    
    const mobileCurrentLangEl = document.getElementById('mobileCurrentLang');
    if (mobileCurrentLangEl) {
        mobileCurrentLangEl.textContent = currentLang.toUpperCase();
    }
    
    // Sorot bahasa saat ini di dropdown mobile
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

// Eksekusi setelah halaman dimuat
document.addEventListener('DOMContentLoaded', async function() {
    // Simpan posisi gulir saat ini
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    
    // Tentukan kedalaman direktori halaman saat ini relatif terhadap direktori id/
    const pathSegments = window.location.pathname.split('/');
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Hapus kode bahasa (id) dari path untuk perhitungan path relatif
    const languageCode = 'id';
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
    
    // Hanya muat daftar alat di beranda atau halaman yang berisi wadah yang sesuai
    const popularToolsContainer = document.getElementById('popularTools');
    if (popularToolsContainer) {
        await displayPopularTools();
    }
    
    const latestToolsContainer = document.getElementById('latestTools');
    if (latestToolsContainer) {
        await displayLatestTools();
    }
    
    // Siapkan menu tarik-turun konversi PDF
    setupPdfDropdown();
    
    // Siapkan menu mobile
    setupMobileMenu();
    
    // Siapkan menu tarik-turun konversi PDF mobile
    setupMobilePdfDropdown();
    
    // Siapkan pengalih bahasa
    setupLanguageSwitcher();
    
    // Siapkan pengalih bahasa mobile
    setupMobileLanguageSwitcher();
    
    // Perbarui tautan pengalih bahasa untuk menjaga path halaman saat ini
    updateLanguageLinks();
    
    // Tandai konten sebagai dimuat, hapus overlay berkedip
    document.body.classList.add('content-loaded');
});

// Dengarkan gulir halaman, simpan posisi gulir
window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('scrollPosition', window.scrollY);
});

// Fungsi untuk memperbaiki path tautan di situs multibahasa
function fixLinkPaths() {
    // Tangani tautan jangkar yang seharusnya menuju ke halaman daftar utama
    // Menggunakan delegasi untuk menangani elemen yang ditambahkan secara dinamis
    document.addEventListener('click', function(event) {
        // Temukan elemen jangkar terdekat terlepas dari kapan itu ditambahkan ke DOM
        const target = event.target.closest('a[href]');
        if (target) {
            const href = target.getAttribute('href');
            
            // Lewati tautan pengalih bahasa (yang memiliki atribut data-lang)
            if (target.hasAttribute('data-lang')) {
                return;
            }
            
            // Periksa apakah kita berada di halaman bahasa Indonesia
            const isIndonesianPage = window.location.pathname.includes('/id/');
            
            if (isIndonesianPage) {
                // Lewati tautan situs utama
                if (href === '/') {
                    return;
                }
                // Tangani tautan root mutlak yang seharusnya diberi awalan /id/
                if (href.startsWith('/') && !href.startsWith('/id/')) {
                    event.preventDefault();
                    const newPath = window.location.origin + '/id' + href;
                    window.location.href = newPath;
                }
                // Tangani tautan seperti /list.html#text-tools yang seharusnya menjadi /id/list.html#text-tools
                else if (href.startsWith('/list.html#') && !href.startsWith('/id/list.html#')) {
                    event.preventDefault();
                    const newPath = window.location.origin + '/id' + href;
                    window.location.href = newPath;
                }
                // Lewati pemrosesan untuk jangkar internal (yang dimulai dengan # tetapi bukan URL sebenarnya)
                // Kita tidak ingin mengalihkan jangkar halaman internal seperti #tutorial
                else if (href.startsWith('#') && !href.startsWith('#/')) {
                    // Izinkan perilaku default untuk jangkar internal
                    return;
                }
            }
        }
    });
}

// Tambahkan efek gulir halus
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

// Panggil fungsi perbaikan path tautan
fixLinkPaths();