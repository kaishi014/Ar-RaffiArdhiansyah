// DATA LENGKAP PROYEK & PRESENTASI
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".achievement-row").forEach(initAchievementCarousel);
});

document.addEventListener("DOMContentLoaded", function () {
    const introLoader = document.querySelector(".intro-loader");
    const spider = document.querySelector(".intro-spiderman");
    const thread = document.querySelector(".intro-thread");
    const web = document.querySelector(".intro-web");
    const ropePath = document.querySelector(".intro-rope-path");
    const ropeGlow = document.querySelector(".intro-rope-glow");
    const ropeSideLeft = document.querySelector(".intro-rope-side-left");
    const ropeSideRight = document.querySelector(".intro-rope-side-right");

    if (!introLoader || !spider || !thread || !web || !ropePath || !ropeGlow || !ropeSideLeft || !ropeSideRight) return;

    let isDragging = false;
    let grabOffsetX = 0;
    let grabOffsetY = 0;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let lastFrame = 0;
    const anchor = { x: window.innerWidth * .44, y: 55 };
    const homeAnchor = { x: anchor.x, y: anchor.y };
    const anchorTarget = { x: anchor.x, y: anchor.y };
    const anchorVelocity = { x: 0, y: 0 };
    const position = { x: 0, y: window.innerHeight * .4 };
    const target = { x: 0, y: position.y };
    const velocity = { x: 0, y: 0 };

    function getBounds() {
        const spiderWidth = spider.offsetWidth || 128;
        const spiderHeight = spider.offsetHeight || 112;
        return {
            minX: -Math.max(0, anchor.x - spiderWidth * .55),
            maxX: Math.max(0, window.innerWidth - anchor.x - spiderWidth * .45),
            minY: 130 - anchor.y,
            maxY: Math.max(130 - anchor.y, window.innerHeight - spiderHeight * .55 - anchor.y)
        };
    }

    function clampPosition(nextX, nextY) {
        const bounds = getBounds();
        return {
            x: Math.max(bounds.minX, Math.min(bounds.maxX, nextX)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, nextY))
        };
    }

    function updateRope() {
        const spiderCenterX = anchor.x + position.x;
        const spiderTopY = anchor.y + position.y - (spider.offsetHeight || 112) * .45;
        const anchorX = anchor.x / window.innerWidth * 100;
        const endX = spiderCenterX / window.innerWidth * 100;
        const endY = Math.max(2, spiderTopY / window.innerHeight * 100);
        const curve = Math.max(-24, Math.min(24, position.x / window.innerWidth * 70));
        const controlX = anchorX + curve;
        const controlY = Math.max(10, endY * .58);
        const rope = `M ${anchorX} 0 Q ${controlX} ${controlY} ${endX} ${endY}`;
        const leftRope = `M ${anchorX - .65} 0 Q ${controlX - .65} ${controlY} ${endX - .65} ${endY}`;
        const rightRope = `M ${anchorX + .65} 0 Q ${controlX + .65} ${controlY} ${endX + .65} ${endY}`;
        ropePath.setAttribute("d", rope);
        ropeGlow.setAttribute("d", rope);
        ropeSideLeft.setAttribute("d", leftRope);
        ropeSideRight.setAttribute("d", rightRope);
    }

    function render() {
        const elapsed = lastFrame ? Math.min((performance.now() - lastFrame) / 16.67, 2) : 1;
        lastFrame = performance.now();

        const anchorForceX = (anchorTarget.x - anchor.x) * .08;
        const anchorForceY = (anchorTarget.y - anchor.y) * .08;
        anchorVelocity.x = (anchorVelocity.x + anchorForceX * elapsed) * Math.pow(.78, elapsed);
        anchorVelocity.y = (anchorVelocity.y + anchorForceY * elapsed) * Math.pow(.78, elapsed);
        anchor.x += anchorVelocity.x * elapsed;
        anchor.y += anchorVelocity.y * elapsed;

        if (!isDragging) {
            const forceX = (target.x - position.x) * .055;
            const forceY = (target.y - position.y) * .055;
            velocity.x = (velocity.x + forceX * elapsed) * Math.pow(.82, elapsed);
            velocity.y = (velocity.y + forceY * elapsed) * Math.pow(.82, elapsed);
            position.x += velocity.x * elapsed;
            position.y += velocity.y * elapsed;

            const bounds = getBounds();
            if (position.x < bounds.minX || position.x > bounds.maxX) {
                position.x = Math.max(bounds.minX, Math.min(bounds.maxX, position.x));
                velocity.x *= -.62;
            }
            if (position.y < bounds.minY || position.y > bounds.maxY) {
                position.y = Math.max(bounds.minY, Math.min(bounds.maxY, position.y));
                velocity.y *= -.62;
            }
        } else {
            position.x = target.x;
            position.y = target.y;
        }

        const ropeLean = Math.max(-14, Math.min(14, position.x * .025 + velocity.x * .35));
        const rotation = 180 + ropeLean;
        spider.style.left = `${anchor.x + position.x}px`;
        spider.style.top = `${anchor.y + position.y}px`;
        spider.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        web.style.transform = `translateX(calc(-50% + ${position.x * .12}px)) scale(1.02) rotate(${position.x * -.012}deg)`;
        updateRope();
        requestAnimationFrame(render);
    }

    function updateTarget(clientX, clientY) {
        const nextPosition = clampPosition(
            clientX - anchor.x - grabOffsetX,
            clientY - anchor.y - grabOffsetY
        );
        const pointerDeltaY = clientY - previousPointerY;
        if (Math.abs(pointerDeltaY) > 0.5) {
            window.scrollBy(0, Math.max(-24, Math.min(24, pointerDeltaY * .8)));
        }
        target.x = nextPosition.x;
        target.y = nextPosition.y;
        anchorTarget.x = homeAnchor.x + target.x * .1;
        anchorTarget.y = homeAnchor.y + Math.max(-8, Math.min(18, target.y * .035));
        previousPointerX = clientX;
        previousPointerY = clientY;
    }

    function releaseElasticPosition() {
        if (!isDragging) return;
        isDragging = false;
        velocity.x = (previousPointerX - (anchor.x + position.x)) * .3;
        velocity.y = (previousPointerY - (anchor.y + position.y)) * .3;
        target.x = 0;
        target.y = Math.max(130 - anchor.y, Math.min(window.innerHeight - 160 - anchor.y, window.innerHeight * .4));
        anchorTarget.x = homeAnchor.x;
        anchorTarget.y = homeAnchor.y;
        spider.classList.remove("is-interactive");
        spider.classList.add("is-releasing");
        window.setTimeout(() => spider.classList.remove("is-releasing"), 950);
    }

    spider.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        isDragging = true;
        grabOffsetX = event.clientX - (anchor.x + position.x);
        grabOffsetY = event.clientY - (anchor.y + position.y);
        previousPointerX = event.clientX;
        previousPointerY = event.clientY;
        spider.classList.remove("is-releasing");
        spider.classList.add("is-interactive");
        spider.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    spider.addEventListener("pointermove", event => {
        if (!isDragging) return;
        updateTarget(event.clientX, event.clientY);
        event.preventDefault();
    });

    spider.addEventListener("pointerup", releaseElasticPosition);
    spider.addEventListener("pointercancel", releaseElasticPosition);
    window.addEventListener("resize", () => {
        homeAnchor.x = window.innerWidth * .44;
        anchorTarget.x = homeAnchor.x;
        const safePosition = clampPosition(position.x, position.y);
        position.x = safePosition.x;
        position.y = safePosition.y;
        target.x = safePosition.x;
        target.y = safePosition.y;
    });

    render();
});

function initAchievementCarousel(row) {
    const track = row.querySelector(".achievement-track");
    const previousButton = row.querySelector(".achievement-prev");
    const nextButton = row.querySelector(".achievement-next");

    if (!track) return;

    const originalCards = Array.from(track.children);
    if (originalCards.length === 0) return;

    originalCards.forEach(card => track.appendChild(card.cloneNode(true)));

    const direction = row.dataset.direction === "right" ? -1 : 1;
    const speed = 42;
    let isPaused = false;
    let isHovered = false;
    let isDragging = false;
    let isButtonScrolling = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let previousTime = 0;

    if (direction < 0) {
        track.scrollLeft = track.scrollWidth / 2;
    }

    function animate(timestamp) {
        const elapsed = previousTime ? Math.min(timestamp - previousTime, 50) : 16;
        previousTime = timestamp;

        if (!isPaused) {
            track.scrollLeft += direction * speed * elapsed / 1000;
            const halfWidth = track.scrollWidth / 2;

            if (direction > 0 && track.scrollLeft >= halfWidth) {
                track.scrollLeft -= halfWidth;
            } else if (direction < 0 && track.scrollLeft <= 0) {
                track.scrollLeft += halfWidth;
            }
        }
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    track.addEventListener("mouseenter", () => {
        isHovered = true;
        updatePauseState();
    });
    track.addEventListener("mouseleave", () => {
        isHovered = false;
        updatePauseState();
    });
    track.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        isDragging = true;
        updatePauseState();
        dragStartX = event.clientX;
        dragStartScrollLeft = track.scrollLeft;
        track.classList.add("is-dragging");
        track.setPointerCapture(event.pointerId);
    });
    track.addEventListener("pointermove", event => {
        if (!isDragging) return;
        track.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
    });
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    function endDrag(event) {
        if (!isDragging) return;
        isDragging = false;
        updatePauseState();
        track.classList.remove("is-dragging");
        if (track.hasPointerCapture(event.pointerId)) {
            track.releasePointerCapture(event.pointerId);
        }
    }

    previousButton.addEventListener("click", () => {
        isButtonScrolling = true;
        updatePauseState();
        track.scrollBy({ left: -320, behavior: "smooth" });
        window.setTimeout(() => {
            isButtonScrolling = false;
            updatePauseState();
        }, 450);
    });
    nextButton.addEventListener("click", () => {
        isButtonScrolling = true;
        updatePauseState();
        track.scrollBy({ left: 320, behavior: "smooth" });
        window.setTimeout(() => {
            isButtonScrolling = false;
            updatePauseState();
        }, 450);
    });

    function updatePauseState() {
        isPaused = isHovered || isDragging || isButtonScrolling;
    }
}

const projectData = {
    'jepang': {
        icon: 'fa-solid fa-language',
        title: 'Web Belajar Bahasa Jepang',
        category: 'Web Application',
        description: 'Website interaktif yang dirancang untuk mempermudah teman-teman pelajar dalam menghafal Hiragana, Katakana, serta kosakata bahasa Jepang sehari-hari secara menyenangkan.',
        features: [
            'Fitur kartu kilat (Flashcards) interaktif',
            'Kuis latihan kosakata sederhana',
            'Desain antarmuka bersih & responsif di smartphone'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript'],
        link: 'jepang.html'
    },
    'siswa-hub': {
    icon: 'fa-solid fa-graduation-cap',
    title: 'Student Productivity Hub (Siswa Hub)',
    category: 'Web App / Productivity & Management',
    description: 'Aplikasi web manajemen produktivitas siswa untuk mengelola jadwal pelajaran, daftar PR & tugas lengkap dengan pengingat notifikasi otomatis, catatan cepat, dan To-Do List harian.',
    features: [
        'Sistem Login / Autentikasi lokal per nama siswa dengan LocalStorage',
        'Manajemen Jadwal Pelajaran & Catatan Cepat dilengkapi stempel waktu',
        'Manajemen PR & Tugas dengan upload foto lampiran soal (opsi klik perbesar)',
        'Sistem Notifikasi Pengingat opsional (dapat diaktifkan/dimatikan per tugas & jadwal)',
        'Integrasi tombol "Tambah ke Google Calendar" untuk pengingat tenggat PR',
        'To-Do List Harian interaktif dan modal konfirmasi hapus data'
    ],
    tech: ['HTML5', 'Tailwind CSS', 'JavaScript (ES6+)', 'Web Notifications API', 'LocalStorage'],
    link: 'siswa.html'
},
    'presentation-osis': {
        icon: 'fa-solid fa-brain',
        title: 'Cara Menggunakan AI yang Sesungguhnya',
        category: 'Keynote & Interactive Learning',
        description: 'Modul interaktif dan panduan komprehensif kolaborasi Human-AI: Mengubah kecerdasan buatan dari sekadar alat jawab cepat menjadi mitra berpikir strategis.',
        features: [
            'Paradigma baru & pembongkaran 3 mitos penggunaan AI',
            'Interaktif: 5 Tingkatan Kematangan Penggunaan AI',
            'Framework Formula C.O.R.E & Generator Prompt Otomatis',
            'Kalkulator Kematangan Penggunaan AI untuk evaluasi mandiri'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript (ES6)', 'Interactive UI'],
        link: 'osis.html' 
    },
    'sudoku': {
        icon: 'fa-solid fa-puzzle-piece',
        title: 'Game Sudoku Puzzle',
        category: 'Web Game',
        description: 'Game teka-teki angka interaktif yang dirancang untuk melatih logika dan konsentrasi dengan berbagai pilihan level kesulitan.',
        features: [
            'Pilihan tingkat kesulitan (Easy, Medium, Hard)',
            'Fitur validasi jawaban & petunjuk (Hint)',
            'Timer dan pencatat rekor skor/waktu terbaik',
            'Desain antarmuka bersih & responsif'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript'],
        link: 'sudoku.html'
    },
    'python-calc': {
        icon: 'fa-solid fa-calculator',
        title: 'Kalkulator Sederhana Python',
        category: 'Python Desktop / CLI',
        description: 'Aplikasi perhitungan berbasis logika Python yang mampu mengeksekusi operasi matematika dasar hingga lanjutan dengan cepat dan akurat.',
        features: [
            'Operasi matematika dasar (+, -, *, /)',
            'Fitur penanganan error jika pembagian nol',
            'Sistem logika fungsi Python terstruktur'
        ],
        tech: ['Python 3', 'Logic & Algorithm'],
        link: 'kalkulator.html'
    },
    'snake-game': {
        icon: 'fa-solid fa-gamepad',
        title: 'Game Ular Classic (Snake Game)',
        category: 'Game Development',
        description: 'Pengembangan game retro klasik ular yang dibuat menggunakan HTML5 Canvas dan JavaScript untuk melatih logika collision detection dan game loop.',
        features: [
            'Kontrol pergerakan responsif',
            'Penghitung skor real-time & rekor tertinggi',
            'Efek kecepatan ular meningkat seiring waktu'
        ],
        tech: ['HTML5 Canvas', 'CSS3', 'JavaScript Logic'],
        link: 'snake.html'
    },
    'registration-pramuka': {
        icon: 'fa-solid fa-campground',
        title: 'Pendaftaran Eskul Pramuka',
        category: 'Form Pendaftaran / Ekstrakurikuler',
        description: 'Layanan pendaftaran online untuk calon anggota baru Ekstrakurikuler Pramuka. Isikan data diri kamu dan konfirmasi akan langsung terhubung ke WhatsApp pengurus.',
        features: [
            'Pengisian data diri ringkas dan practical',
            'Timestamp otomatis (Hari, Tanggal, Jam kirim)',
            'Pengiriman konfirmasi langsung ke WhatsApp'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript', 'WhatsApp API'],
        link: 'whatsaap.html'      
    },
    'morse-semaphore': {
        icon: 'fa-solid fa-tower-cell',
        title: 'Latihan Morse & Semaphore Interaktif',
        category: 'Edukasi & Simulasi Sinyal',
        description: 'Media pembelajaran interaktif yang menggabungkan latihan penerjemahan kode Morse (audio/visual) dan gerakan bendera Semaphore dalam satu aplikasi.',
        features: [
            'Konversi teks ke Morse (audio/visual) dan sebaliknya',
            'Panduan visual posisi tangan dan bendera Semaphore (A-Z)',
            'Mode kuis tebak kata dan simulasi latihan kecepatan',
            'Fitur evaluasi skor dan waktu penyelesaian'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Web Audio API'],
        link: 'sandi.html'
    },
    'bg-remover': {
        icon: 'fa-solid fa-image-user',
        title: 'Hapus Background Foto Automatic',
        category: 'Web App / Image Processing',
        description: 'Aplikasi berbasis web untuk menghapus latar belakang foto secara otomatis dan presisi tinggi menggunakan integrasi API pemrosesan gambar.',
        features: [
            'Penghapusan latar belakang otomatis berbasis AI API',
            'Fitur upload foto (Drag & Drop) serta pratinjau hasil secara real-time',
            'Unduh hasil foto berformat PNG transparan',
            'Sistem penanganan error jika limit API habis atau format file tidak valid'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript', 'REST API', 'Fetch API'],
        link: 'bgRemove.html'
    },
    'morse': {
        icon: 'fa-solid fa-lightbulb',
        title: 'Web Senter Transceiver Morse',
        category: 'Web Application',
        description: 'Website interaktif yang memanfaatkan kilat kamera (flash/torch) pada smartphone untuk mengirimkan pesan rahasia atau sinyal darurat menggunakan pola kode Morse secara otomatis.',
        features: [
            'Pengiriman sinyal Morse otomatis melalui senter HP',
            'Pengaturan pola kode Morse dan durasi kedipan langsung di dalam kode',
            'Desain antarmuka gelap (Dark Mode) yang rapi dan responsif'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript (MediaDevices API)'],
        link: 'morse.html' 
    }
};

// FUNGSI MEMBUKA MODAL
function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;
    
    document.getElementById('modalIcon').className = data.icon;
    document.getElementById('modalTitle').innerText = data.title;
    document.getElementById('modalCategory').innerText = data.category;
    document.getElementById('modalDescription').innerText = data.description;
    
    // Render Fitur
    const featuresContainer = document.getElementById('modalFeatures');
    featuresContainer.innerHTML = '';
    data.features.forEach(ft => {
        const li = document.createElement('li');
        li.innerText = ft;
        featuresContainer.appendChild(li);
    });
    
    // Render Tech Tags
    const techContainer = document.getElementById('modalTech');
    techContainer.innerHTML = '';
    data.tech.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tech-tag';
        span.innerText = t;
        techContainer.appendChild(span);
    });
    
    // Link Action Button
    const actionBtn = document.getElementById('modalActionBtn');
    actionBtn.href = data.link;
    
    // Tampilkan Overlay Modal
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden'; // Matikan scroll latar belakang
}

// FUNGSI MENUTUP MODAL
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto'; // Aktifkan scroll kembali
}

document.addEventListener("DOMContentLoaded", function() {
    initProjects();
});

function initProjects() {
    const cards = document.querySelectorAll(".project-card");
    const maxVisible = 4;
    
    cards.forEach((card, index) => {
        if (index >= maxVisible) {
            card.classList.add("hidden");
        }
    });

    const btnContainer = document.getElementById("projectLoadMoreBtn");
    if (cards.length <= maxVisible && btnContainer) {
        btnContainer.parentElement.style.display = "none";
    }
}

function toggleProjects() {
    const hiddenCards = document.querySelectorAll(".project-card.hidden");
    const allCards = document.querySelectorAll(".project-card");
    const btnText = document.getElementById("projectLoadMoreText");
    const btnIcon = document.getElementById("projectLoadMoreIcon");
    const maxVisible = 4;

    if (hiddenCards.length > 0) {
        allCards.forEach(card => card.classList.remove("hidden"));
        btnText.innerText = "Sembunyikan";
        btnIcon.className = "fa-solid fa-chevron-up";
    } else {
        allCards.forEach((card, index) => {
            if (index >= maxVisible) {
                card.classList.add("hidden");
            }
        });
        btnText.innerText = "Lihat Lebih Banyak";
        btnIcon.className = "fa-solid fa-chevron-down";
        document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
    }
}

function initAchievements() {
    const cards = document.querySelectorAll("#moments .achievement-card");
    const maxVisible = 5;

    cards.forEach((card, index) => {
        if (index >= maxVisible) {
            card.classList.add("hidden");
        }
    });
    
    // Sembunyikan tombol jika total kartu <= 5
    const btnContainer = document.querySelector("#moments .load-more-container");
    if (cards.length <= maxVisible && btnContainer) {
        btnContainer.style.display = "none";
    }
}

function toggleAchievements() {
    const hiddenCards = document.querySelectorAll("#moments .achievement-card.hidden");
    const allCards = document.querySelectorAll("#moments .achievement-card");
    const btnText = document.getElementById("loadMoreText");
    const btnIcon = document.getElementById("loadMoreIcon");
    const maxVisible = 5;
    
    // Jika ada kartu yang masih tersembunyi -> Tampilkan Semua
    if (hiddenCards.length > 0) {
        allCards.forEach(card => card.classList.remove("hidden"));
        btnText.innerText = "Sembunyikan";
        btnIcon.className = "fa-solid fa-chevron-up";
    } else {
        // Jika semua kartu sudah tampil -> Sembunyikan kembali
        allCards.forEach((card, index) => {
            if (index >= maxVisible) {
                card.classList.add("hidden");
            }
        });
        btnText.innerText = "Lihat Lebih Banyak";
        btnIcon.className = "fa-solid fa-chevron-down";
        
        // Scroll halus kembali ke judul section prestasi
        document.getElementById("moments").scrollIntoView({ behavior: "smooth" });
    }
}

function closeModalOnOuterClick(event) {
    if (event.target.id === 'modalOverlay') {
        closeModal();
    }
}

// ANIMASI SCROLL (FADE IN)
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", reveal);
reveal();

// Fungsi membuka Lightbox Gambar Full
function openLightbox(imgElement) {
    const lightbox = document.getElementById("imageLightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    
    lightboxImg.src = imgElement.src;
    lightboxCaption.innerText = imgElement.alt || "Moments Arraffi";
    
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Mencegah scroll halaman di belakang
}

// Fungsi menutup Lightbox Gambar
function closeLightbox(event) {
    const lightbox = document.getElementById("imageLightbox");
    
    // Tutup jika mengeklik area latar gelap atau tombol close (X)
    if (event.target === lightbox || event.target.classList.contains("lightbox-close")) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto"; // Mengembalikan scroll halaman
    }
}

// Otomatis tambahkan event click ke semua gambar prestasi setelah halaman dimuat
document.addEventListener("DOMContentLoaded", function() {
    const achievementImages = document.querySelectorAll(".achievement-img-wrapper img");
    achievementImages.forEach(img => {
        img.addEventListener("click", function(event) {
            event.stopPropagation();
            openLightbox(this);
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const achievementCards = document.querySelectorAll("#achievements .achievement-card");

    achievementCards.forEach(card => {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");

        const toggleCard = () => {
            const shouldOpen = !card.classList.contains("is-open");
            achievementCards.forEach(otherCard => otherCard.classList.remove("is-open"));
            if (shouldOpen) card.classList.add("is-open");
        };

        card.addEventListener("click", toggleCard);
        card.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            toggleCard();
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.querySelector(".nav-links");
    const projectCards = document.querySelectorAll(".clickable-card");

    projectCards.forEach(card => {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.addEventListener("keydown", function(event) {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            card.click();
        });
    });

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function() {
            const isOpen = navLinks.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
            navToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", function() {
                navLinks.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
                navToggle.setAttribute("aria-label", "Buka menu navigasi");
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key !== "Escape") return;

    const modalOverlay = document.getElementById("modalOverlay");
    const lightbox = document.getElementById("imageLightbox");
    if (modalOverlay && modalOverlay.classList.contains("active")) closeModal();
    if (lightbox && lightbox.classList.contains("active")) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto";
    }
});
