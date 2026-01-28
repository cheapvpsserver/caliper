// Logika Rekomendasi Alat Terkait
// Script ini dapat disertakan di halaman alat apa pun untuk menampilkan alat terkait secara otomatis

function initRelatedTools(currentSlug) {
    // Periksa apakah wadah relatedTools ada
    const container = document.getElementById('relatedTools');
    if (!container) {
        console.warn('Wadah alat terkait tidak ditemukan, melewati inisialisasi alat terkait');
        return;
    }
    
    // Pemetaan ikon alat - menggunakan ikon Font Awesome sebagai ganti gambar
    // Ini harus identik dengan toolIcons di script.js untuk memastikan ikon yang konsisten di seluruh halaman
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
    
    // Tentukan path yang benar ke tools.json berdasarkan lokasi halaman saat ini
    // tools.json selalu berada di folder data di root situs web
    const pathSegments = window.location.pathname.split('/');
    // Saring string kosong
    const nonEmptySegments = pathSegments.filter(segment => segment !== '');
    
    // Hapus kode bahasa (id) dari path untuk perhitungan path relatif
    const languageCode = 'id';
    const languageIndex = nonEmptySegments.indexOf(languageCode);
    let relativeSegments = nonEmptySegments;
    
    if (languageIndex !== -1) {
        relativeSegments = nonEmptySegments.slice(languageIndex + 1);
    }
    
    // Hitung kedalaman direktori - tidak termasuk nama file
    let directoryDepth = 0;
    if (relativeSegments.length > 0) {
        // Jika segmen terakhir berisi ekstensi (misalnya, nama file), kurangi 1
        const lastSegment = relativeSegments[relativeSegments.length - 1];
        directoryDepth = lastSegment.includes('.') ? relativeSegments.length - 1 : relativeSegments.length;
    }
    // Hitung jumlah level untuk kembali berdasarkan kedalaman direktori
    const basePath = directoryDepth > 0 ? '../'.repeat(directoryDepth) : '';
    // Detect language from URL (/bn/xxx or /zh/xxx or /en/xxx)
    const langMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
    const lang = langMatch ? langMatch[1] : 'en';
    
    // Load language-specific tools.json
    const toolsJsonPath = `/${lang}/data/tools.json`;
    
    fetch(toolsJsonPath)
        .then(res => res.json())
        .then(tools => {
            console.log('Alat dimuat:', tools.length);
            console.log('Mencari slug:', currentSlug);
            const current = tools.find(t => t.slug === currentSlug);
            
            console.log('Alat saat ini ditemukan:', current);
            
            if (current) {
                console.log('Kategori alat saat ini:', current.category);
                console.log('Tag alat saat ini:', current.tags);
                
                const related = tools
                    // Pertama-tama pastikan untuk mengecualikan alat saat ini terlepas dari kondisi lainnya
                    .filter(t => t.id !== current.id && t.slug !== currentSlug)
                    .map(t => {
                        let score = 0;
                        // Kategori yang sama mendapat poin
                        if (t.category === current.category) {
                            score += 3;
                            console.log('Kategori yang sama dengan', t.name, 'menambahkan 3 poin');
                        }
                        // Poin untuk tag yang sama
                        t.tags.forEach(tag => {
                            if (current.tags.includes(tag)) {
                                score += 1;
                                console.log('Tag yang sama', tag, 'dengan', t.name, 'menambahkan 1 poin');
                            }
                        });
                        // Pemberatan popularitas
                        score += t.hot_score * 0.001;
                        console.log('Alat', t.name, 'nilai:', score);
                        return { ...t, score };
                    })
                    .filter(t => t.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
                
                console.log('Alat terkait ditemukan:', related.length);
                
                const container = document.getElementById('relatedTools');
                
                if (related.length > 0) {
                    container.innerHTML = related.map(tool => {
                            // Dapatkan kelas ikon Font Awesome, gunakan default jika tidak ditemukan
                            const iconClass = toolIcons[tool.slug] || "fas fa-tools";
                            
                            // Tentukan URL yang benar untuk alat
                            let toolUrl = tool.url;
                            if (toolUrl === '#') {
                                // Tautan placeholder menuju ke halaman beranda
                                toolUrl = `${basePath}index.html`;
                            } else {
                                // Semua alat sekarang menggunakan format path yang benar, cukup tambahkan basePath
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
                    container.innerHTML = '<p class="text-center text-gray-500">Tidak ada alat terkait yang ditemukan.</p>';
                }
            } else {
                console.error('Alat saat ini tidak ditemukan dengan slug:', currentSlug);
                const container = document.getElementById('relatedTools');
                container.innerHTML = '<p class="text-center text-gray-500">Gagal memuat alat terkait.</p>';
            }
        })
        .catch(error => {
            console.error('Kesalahan saat memuat alat terkait:', error);
            const container = document.getElementById('relatedTools');
            container.innerHTML = '<p class="text-center text-gray-500">Gagal memuat alat terkait.</p>';
        });
}

// Ekspor fungsi untuk digunakan di skrip lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initRelatedTools;
}