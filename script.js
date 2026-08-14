        // DATA LENGKAP PROYEK & PRESENTASI
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
            'presentation-osis': {
                icon: 'fa-solid fa-person-chalkboard',
                title: 'Presentasi Leadership & OSIS',
                category: 'Public Speaking & Presentation',
                description: 'Materi presentasi program kerja dan kepemimpinan yang dibawakan saat menjabat sebagai pengurus OSIS periode 2024–2025.',
                features: [
                    'Penyusunan slide visual yang terstruktur',
                    'Penyampaian gagasan program kerja unggulan',
                    'Peningkatan keterlibatan audiens dalam sesi tanya jawab'
                ],
                tech: ['Public Speaking', 'Leadership', 'Canva / PPT', 'Communication'],
                link: '#'
            },
            'competitions': {
                icon: 'fa-solid fa-trophy',
                title: 'Juara & Prestasi Lomba',
                category: 'Achievements',
                description: 'Pengalaman bertanding dan memenangkan berbagai kompetisi baik bidang akademik, keorganisasian, maupun olahraga/seni.',
                features: [
                    'Pengalaman bertanding di tingkat sekolah dan daerah',
                    'Penerapan disiplin latihan dari Pencak Silat & Marching Band',
                    'Kerja sama tim yang solid saat berorientasi kompetisi'
                ],
                tech: ['Mental Juara', 'Disiplin', 'Kerja Sama Tim'],
                link: '#'
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
