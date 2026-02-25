/* ========================================
   そーふgame 公式サイト - JavaScript
   ======================================== */

// --- パーティクル背景 ---
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
                hue: Math.random() > 0.5 ? 261 : 270,
            });
        }
    }

    drawParticle(p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
        this.ctx.fill();
    }

    drawConnections() {
        const maxDist = 120;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `hsla(261, 60%, 55%, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    update() {
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            // マウスとのインタラクション
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.vx += (dx / dist) * force * 0.02;
                    p.vy += (dy / dist) * force * 0.02;
                }
            }

            // 速度制限
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1) {
                p.vx = (p.vx / speed) * 1;
                p.vy = (p.vy / speed) * 1;
            }

            // 画面端で跳ね返り
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // 画面内に収める
            p.x = Math.max(0, Math.min(this.canvas.width, p.x));
            p.y = Math.max(0, Math.min(this.canvas.height, p.y));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
        this.drawConnections();
        for (const p of this.particles) {
            this.drawParticle(p);
        }
        requestAnimationFrame(() => this.animate());
    }
}

// --- ナビゲーション ---
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.toggle = document.getElementById('navToggle');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileLinks = document.querySelectorAll('.mobile-link');
        this.sections = document.querySelectorAll('section[id]');
        this.isOpen = false;

        this.init();
    }

    init() {
        // スクロールイベント
        window.addEventListener('scroll', () => this.onScroll());

        // モバイルメニュートグル
        this.toggle.addEventListener('click', () => this.toggleMenu());

        // モバイルリンク
        this.mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // 初期チェック
        this.onScroll();
    }

    onScroll() {
        // ナビバー背景
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // アクティブリンク
        const scrollPos = window.scrollY + 100;
        this.sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.toggle.classList.toggle('active');
        this.mobileMenu.classList.toggle('active');
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    closeMenu() {
        this.isOpen = false;
        this.toggle.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// --- スクロールアニメーション ---
class ScrollReveal {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        // アニメーション対象要素にクラスを追加
        const selectors = [
            '.about-card',
            '.platform-card',
            '.schedule-card',
            '.contact-card',
            '.section-header',
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.add('reveal');
                this.elements.push(el);
            });
        });

        // Intersection Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // 遅延をつけてアニメーション
                        const delay = Array.from(entry.target.parentElement.children)
                            .indexOf(entry.target) * 100;
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        this.elements.forEach(el => observer.observe(el));
    }
}

// --- テキストタイピングエフェクト ---
class TypeWriter {
    constructor(element, text, speed = 80) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
    }

    start() {
        if (this.index < this.text.length) {
            this.element.textContent += this.text.charAt(this.index);
            this.index++;
            setTimeout(() => this.start(), this.speed);
        }
    }
}

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    // パーティクルシステム
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }

    // ナビゲーション
    new Navigation();

    // スクロールアニメーション
    new ScrollReveal();

    // スムーズスクロール（ナビリンク）
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
