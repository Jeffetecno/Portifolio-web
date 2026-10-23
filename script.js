// Marca que o JS está ativo (fallback: sem JS, conteúdo .fade-up fica visível)
document.documentElement.classList.add('js');

// Menu mobile
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        navLinks.classList.toggle('show', !isExpanded);
        menuBtn.setAttribute('aria-expanded', String(!isExpanded));
        menuBtn.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('show');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.setAttribute('aria-label', 'Open navigation menu');
        });
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.setAttribute('aria-label', 'Open navigation menu');
            menuBtn.focus();
        }
    });
}

// Carrossel dos projetos
const carousel = document.querySelector('.projects-carousel');
const track = document.querySelector('.projects-track');

if (carousel && track) {
    const originalCards = Array.from(track.children);

    if (originalCards.length > 1) {
        originalCards.forEach((card) => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        const gap = parseFloat(getComputedStyle(track).gap || '0');
        let translateX = 0;
        let isUserFocused = false;
        let focusTimeout = null;

        function updateActiveState() {
            const viewportCenter = carousel.getBoundingClientRect().left + (carousel.clientWidth / 2);
            let activeCard = null;
            let smallestDistance = Infinity;

            Array.from(track.children).forEach((card) => {
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.left + (rect.width / 2);
                const distance = Math.abs(cardCenter - viewportCenter);

                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    activeCard = card;
                }
            });

            Array.from(track.children).forEach((card) => {
                card.classList.toggle('is-active', card === activeCard);
            });
        }

        function render() {
            track.style.transform = `translate3d(${translateX}px, 0, 0)`;
            track.style.transition = isUserFocused
                ? 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
                : 'none';

            updateActiveState();
        }

        function moveRight() {
            if (isUserFocused) return;

            const firstCard = track.firstElementChild;
            if (!firstCard) return;

            const firstRect = firstCard.getBoundingClientRect();
            const containerLeft = carousel.getBoundingClientRect().left;

            translateX -= 0.9;

            if (firstRect.right < containerLeft - 10) {
                const cardWidth = firstCard.offsetWidth + gap;
                track.appendChild(firstCard);
                translateX += cardWidth;
            }

            render();
        }

        function focusCard(clickedCard) {
            const viewportCenter = carousel.getBoundingClientRect().left + (carousel.clientWidth / 2);
            const clickedRect = clickedCard.getBoundingClientRect();
            const clickedCenter = clickedRect.left + (clickedRect.width / 2);

            isUserFocused = true;
            translateX += viewportCenter - clickedCenter;
            render();

            clearTimeout(focusTimeout);
            focusTimeout = setTimeout(() => {
                isUserFocused = false;
            }, 900);
        }

        track.addEventListener('click', (event) => {
            const clickedCard = event.target.closest('.project-card');
            if (!clickedCard) return;
            focusCard(clickedCard);
        });

        render();
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setInterval(moveRight, 16);
        }
        window.addEventListener('resize', render);
    }
}

// Animação ao rolar
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('show'));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.15
    });

    document
        .querySelectorAll('.fade-up')
        .forEach(el => observer.observe(el));
}
// Contadores animados dos indicadores
const counters = document.querySelectorAll('[data-count]');

if (counters.length) {
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + Math.round(eased * target) + (progress === 1 ? suffix : '');
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    if (prefersReducedMotion) {
        counters.forEach(el => {
            el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
        });
    } else {
        counters.forEach(el => counterObserver.observe(el));
    }
}

// Nav ativa conforme a seção visível
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

if (sections.length && navAnchors.length) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navAnchors.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(section => navObserver.observe(section));
}

// FAQ: fecha os outros ao abrir um
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
        if (item.open) {
            faqItems.forEach(other => {
                if (other !== item) other.open = false;
            });
        }
    });
});

// Animação de zoom do banner (carteira)
const impactBanner = document.querySelector('.impact-banner');

if (impactBanner) {
    if (prefersReducedMotion) {
        impactBanner.classList.add('in-view');
    } else {
        const bannerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    impactBanner.classList.add('in-view');
                    bannerObserver.disconnect();
                }
            });
        }, { threshold: 0.25 });

        bannerObserver.observe(impactBanner);
    }
}

// Formulário de contato → WhatsApp
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const WHATSAPP_NUMBER = '5554999768323';

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = new FormData(contactForm);
        const name = data.get('name').trim();
        const type = data.get('type');
        const message = data.get('message').trim();

        const text = [
            `Olá, Jefferson! Meu nome é ${name}.`,
            `Tenho interesse em: ${type}.`,
            '',
            message
        ].join('\n');

        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
            '_blank',
            'noopener'
        );
    });
}
