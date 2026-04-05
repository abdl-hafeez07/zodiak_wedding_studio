// === NAVBAR SCROLL EFFECT ===
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// === MOBILE MENU ===
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuClose = document.querySelector('.mobile-menu-close');
const body = document.body;

function openMobileMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('active');
    body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
    body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
});

// FIX: Close button inside mobile menu
if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}

// Close when a nav link is clicked
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close mobile menu on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}, { passive: true });

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
        hamburger.focus();
    }
});

// === SCROLL ANIMATIONS (INTERSECTION OBSERVER) ===
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// === SMOOTH ANCHOR SCROLL FALLBACK ===
// Handles browsers that don't support CSS scroll-behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// === ACTIVE NAV LINK HIGHLIGHT ===
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNavLink() {
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
        if (
            scrollPos >= section.offsetTop &&
            scrollPos < section.offsetTop + section.offsetHeight
        ) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + section.id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink, { passive: true });

// === CONTACT FORM SUBMISSION ===
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic client-side validation
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
        let allValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderBottomColor = '#e05252';
                allValid = false;
            } else {
                input.style.borderBottomColor = '';
            }
        });

        if (!allValid) return;

        const btn = contactForm.querySelector('.submit-btn');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        setTimeout(() => {
            // Show a more elegant success message (instead of browser alert)
            showFormSuccess(contactForm);
            contactForm.reset();
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 1500);
    });
}

function showFormSuccess(form) {
    // Remove any existing message
    const existing = document.querySelector('.form-success-msg');
    if (existing) existing.remove();

    const msg = document.createElement('p');
    msg.className = 'form-success-msg';
    msg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! We will contact you within 24 hours.';
    msg.style.cssText = `
        color: var(--primary-gold);
        font-size: 0.9rem;
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: fadeIn 0.5s ease;
    `;
    form.appendChild(msg);

    // Auto-remove success message after 5s
    setTimeout(() => msg.remove(), 5000);
}

// === COSTUME SHOWCASE — VIDEO CROSSFADE ROTATOR ===
(function () {
    const videos = Array.from(document.querySelectorAll('.showcase-video'));
    const dots = Array.from(document.querySelectorAll('.showcase-dots .dot'));
    const fill = document.getElementById('showcaseProgressFill');
    const section = document.getElementById('home');

    if (!videos.length || !section) return;

    const INTERVAL = 5000;

    let current = 0;
    let timer = null;
    let progTimer = null;

    // Eagerly preload all videos; if local file errors, swap to fallback immediately
    function loadWithFallback(v) {
        v.load();
        v.addEventListener('error', () => {
            const fb = v.dataset.fallback;
            if (fb && v.getAttribute('src') !== fb) {
                v.setAttribute('src', fb);
                v.load();
                if (v.classList.contains('active')) v.play().catch(() => { });
            }
        }, { once: true });
    }
    videos.forEach(v => loadWithFallback(v));

    function startProgress() {
        if (!fill) return;
        fill.style.transition = 'none';
        fill.style.width = '0%';
        // Force reflow
        void fill.offsetWidth;
        fill.style.transition = `width ${INTERVAL}ms linear`;
        fill.style.width = '100%';
    }

    function goTo(index) {
        // Deactivate old
        videos[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');

        current = ((index % videos.length) + videos.length) % videos.length;

        // Activate new
        const v = videos[current];
        v.play().catch(() => { });
        v.classList.add('active');
        if (dots[current]) dots[current].classList.add('active');

        startProgress();
    }

    function startRotation() {
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), INTERVAL);
    }

    function stopRotation() {
        clearInterval(timer);
        timer = null;
        // Freeze progress bar in place
        if (fill) {
            const w = fill.getBoundingClientRect().width;
            const parentW = fill.parentElement.getBoundingClientRect().width;
            fill.style.transition = 'none';
            fill.style.width = parentW ? `${(w / parentW) * 100}%` : '0%';
        }
    }

    // Dot click
    dots.forEach((dot, i) => {
        const jump = () => { goTo(i); startRotation(); };
        dot.addEventListener('click', jump);
        dot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); } });
    });

    // Initial play — if local file unsupported/missing, switch to fallback
    (function tryPlay(v) {
        v.play().catch(() => {
            const fb = v.dataset.fallback;
            if (fb && v.getAttribute('src') !== fb) {
                v.setAttribute('src', fb);
                v.load();
                v.play().catch(() => { });
            }
        });
    })(videos[0]);
    startProgress();

    // IntersectionObserver — pause when off-screen
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                videos[current].play().catch(() => { });
                startRotation();
            } else {
                videos.forEach(v => v.pause());
                stopRotation();
            }
        });
    }, { threshold: 0.15 });

    io.observe(section);
})();

/* ========================
   Editorial Collection Card Stacking Parallax
   ======================== */
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.editorial-row');
    if (!cards.length) return;

    let ticking = false;

    function buildStackAnimation() {
        const viewportHeight = window.innerHeight;
        const stickyTop = viewportHeight * 0.15; // Maps to 15vh in CSS

        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            // Start calculation when card reaches its sticky position
            if (rect.top <= stickyTop + 2) {
                const nextCard = cards[index + 1];
                if (nextCard) {
                    const nextRect = nextCard.getBoundingClientRect();
                    // Distance from the next card's top to the sticky origin
                    const distance = Math.max(0, nextRect.top - stickyTop);

                    // The range over which the transition occurs (roughly one viewport height)
                    const range = viewportHeight * 0.8;
                    let progress = 0;

                    if (distance <= range) {
                        progress = 1 - (distance / range);
                        progress = Math.max(0, Math.min(1, progress));

                        // Map progress to scale (1 -> 0.9) and brightness (1 -> 0.6)
                        const scale = 1 - (0.1 * progress);
                        const brightness = 1 - (0.4 * progress);
                        const blur = 3 * progress;

                        card.style.transform = `scale(${scale}) translateZ(0)`;
                        card.style.filter = `brightness(${brightness}) blur(${blur}px)`;
                    } else {
                        // Reset if next card is far away
                        card.style.transform = `scale(1) translateZ(0)`;
                        card.style.filter = `brightness(1) blur(0)`;
                    }
                }
            } else {
                // Card hasn't reached sticky position yet
                card.style.transform = `scale(1) translateZ(0)`;
                card.style.filter = `brightness(1) blur(0)`;
            }
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(buildStackAnimation);
            ticking = true;
        }
    });

    // Run once to initialize any cards in view
    buildStackAnimation();
});

/* ========================
   Collage Gallery Image Rotator
   ======================== */
document.addEventListener('DOMContentLoaded', () => {
    const rotatorCards = document.querySelectorAll('.rotator-card');

    rotatorCards.forEach(card => {
        const images = card.querySelectorAll('.collage-img');
        if (images.length <= 1) return;

        let currentIndex = 0;

        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 4000);
    });
});