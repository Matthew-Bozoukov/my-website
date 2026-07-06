// ============================================================
// Mobile navigation
// ============================================================
class MobileNavigation {
    constructor() {
        this.menuOpen = false;
        this.init();
    }

    init() {
        const mobileButton = document.getElementById('toggle-navigation-menu');
        const header = document.getElementById('main-header');
        if (!mobileButton || !header) return;

        mobileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu(header, mobileButton);
        });

        // Close menu when a nav link is clicked
        document.querySelectorAll('#navigation-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (this.menuOpen) this.toggleMenu(header, mobileButton);
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.menuOpen && !e.target.closest('#main-header')) {
                this.toggleMenu(header, mobileButton);
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuOpen) {
                this.toggleMenu(header, mobileButton);
            }
        });
    }

    toggleMenu(header, button) {
        this.menuOpen = !this.menuOpen;
        header.classList.toggle('menu-open', this.menuOpen);
        document.body.classList.toggle('menu-open', this.menuOpen);
        document.body.style.overflow = this.menuOpen ? 'hidden' : '';
        button.setAttribute('aria-expanded', this.menuOpen.toString());
    }
}

// ============================================================
// Smooth scrolling for in-page navigation
// ============================================================
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#') return; // logo handled elsewhere

                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();
                const header = document.getElementById('main-header');
                const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
                const targetPosition =
                    window.pageYOffset + targetElement.getBoundingClientRect().top - (headerHeight + 8);

                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                history.pushState(null, '', targetId);
            });
        });
    }
}

// ============================================================
// Easter egg: wrap every 'b'/'B' so it can be hovered & clicked
// ============================================================
(function () {
    function applyBHoverEffect(root) {
        const targetRoot = root || document.body;
        if (!targetRoot) return;

        const walker = document.createTreeWalker(targetRoot, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const value = node.nodeValue;
                if (!value || (value.indexOf('b') === -1 && value.indexOf('B') === -1)) {
                    return NodeFilter.FILTER_REJECT;
                }
                const parent = node.parentNode;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.nodeName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
                    return NodeFilter.FILTER_REJECT;
                }
                if (parent.classList && parent.classList.contains('hover-b')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const nodes = [];
        let current;
        while ((current = walker.nextNode())) nodes.push(current);

        nodes.forEach((textNode) => {
            const text = textNode.nodeValue;
            const fragment = document.createDocumentFragment();
            let buffer = '';

            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === 'b' || ch === 'B') {
                    if (buffer) {
                        fragment.appendChild(document.createTextNode(buffer));
                        buffer = '';
                    }
                    const span = document.createElement('span');
                    span.className = 'hover-b';
                    span.textContent = ch;
                    fragment.appendChild(span);
                } else {
                    buffer += ch;
                }
            }
            if (buffer) fragment.appendChild(document.createTextNode(buffer));
            if (textNode.parentNode) textNode.parentNode.replaceChild(fragment, textNode);
        });
    }

    window.applyBHoverEffect = applyBHoverEffect;
})();

// ============================================================
// Easter egg: clicking a 'b'/'B' releases a bee
// ============================================================
(function () {
    function spawnBeeFromElement(el) {
        const rect = el.getBoundingClientRect();
        const bee = document.createElement('div');
        bee.className = 'flying-bee';
        bee.textContent = '🐝';
        bee.style.left = rect.left + rect.width / 2 + 'px';
        bee.style.top = rect.top + rect.height / 2 + 'px';

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(window.innerWidth, window.innerHeight) + 200;
        bee.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        bee.style.setProperty('--dy', Math.sin(angle) * distance + 'px');

        document.body.appendChild(bee);

        const cleanup = () => { if (bee.parentNode) bee.parentNode.removeChild(bee); };
        bee.addEventListener('animationend', cleanup, { once: true });
        setTimeout(cleanup, 4000);
    }

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.classList && target.classList.contains('hover-b')) {
            spawnBeeFromElement(target);
        }
    });
})();

// ============================================================
// Easter egg: party-hat explosion on logo click
// ============================================================
class PartyHatExplosion {
    constructor() {
        this.init();
    }

    init() {
        const logoLink = document.querySelector('#main-header a[href="#"]');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.triggerExplosion();
            });
        }
    }

    triggerExplosion() {
        const logoSvg = document.querySelector('#main-header svg');
        if (!logoSvg) return;

        logoSvg.classList.add('logo-party-pulse');
        setTimeout(() => logoSvg.classList.remove('logo-party-pulse'), 600);

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const rect = logoSvg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        this.createPartyHats(cx, cy);
        this.createSparkles(cx, cy);
    }

    createPartyHats(cx, cy) {
        const hatCount = 12;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        for (let i = 0; i < hatCount; i++) {
            const hat = document.createElement('div');
            hat.className = 'party-hat';
            hat.innerHTML = this.getPartyHatSVG(colors[i % colors.length]);
            const radian = ((360 / hatCount) * i * Math.PI) / 180;
            const distance = 150 + Math.random() * 100;
            hat.style.left = cx + 'px';
            hat.style.top = cy + 'px';
            document.body.appendChild(hat);

            setTimeout(() => {
                hat.classList.add('exploding');
                hat.style.transition = 'left 2s cubic-bezier(0.25,0.46,0.45,0.94), top 2s cubic-bezier(0.25,0.46,0.45,0.94)';
                hat.style.left = cx + Math.cos(radian) * distance + 'px';
                hat.style.top = cy + Math.sin(radian) * distance + 'px';
            }, i * 50);

            setTimeout(() => { if (hat.parentNode) hat.parentNode.removeChild(hat); }, 2600);
        }
    }

    createSparkles(cx, cy) {
        const sparkleCount = 20;
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'party-sparkle';
            sparkle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            const radian = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 120;
            sparkle.style.left = cx + 'px';
            sparkle.style.top = cy + 'px';
            document.body.appendChild(sparkle);

            setTimeout(() => {
                sparkle.style.transition = 'left 1.5s ease-out, top 1.5s ease-out, opacity 1.5s ease-out';
                sparkle.style.left = cx + Math.cos(radian) * distance + 'px';
                sparkle.style.top = cy + Math.sin(radian) * distance + 'px';
                sparkle.style.opacity = '0';
            }, i * 30);

            setTimeout(() => { if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle); }, 2000);
        }
    }

    getPartyHatSVG(color) {
        return `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 L20 80 L80 80 Z" fill="${color}" stroke="#333" stroke-width="2"/>
                <ellipse cx="50" cy="80" rx="30" ry="8" fill="#333"/>
                <path d="M25 35 L75 35" stroke="white" stroke-width="2" opacity="0.8"/>
                <path d="M30 50 L70 50" stroke="white" stroke-width="2" opacity="0.8"/>
                <path d="M35 65 L65 65" stroke="white" stroke-width="2" opacity="0.8"/>
                <circle cx="50" cy="10" r="6" fill="white" stroke="#333" stroke-width="1"/>
                <circle cx="50" cy="10" r="3" fill="${color}"/>
            </svg>`;
    }
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    new MobileNavigation();
    new SmoothScroll();
    new PartyHatExplosion();

    if (typeof window.applyBHoverEffect === 'function') {
        window.applyBHoverEffect(document.querySelector('main'));
    }

    console.log('%c🎉 Click the logo for a surprise — and try clicking any "b".', 'color:#f87171');
});
