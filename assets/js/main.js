// Externalized page scripts to allow a stricter Content Security Policy
// This file contains the reveal-on-scroll logic and the IntersectionObserver
// that toggles the .active class on nav links when their section becomes active.

document.addEventListener('DOMContentLoaded', () => {
    // Reveal animation for .content-section (keeps previous behavior)
    const contentSections = document.querySelectorAll('.content-section');

    const handleScroll = () => {
        contentSections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const triggerPoint = window.innerHeight - 100;

            if (sectionTop < triggerPoint) {
                section.classList.add('show');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // run on load

    // Glowing active link when a section is active
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('section[id]');

    // Map id -> link for quick lookup
    const linkById = {};
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) linkById[href.slice(1)] = link;
    });

    // Use IntersectionObserver to detect which section is in view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.55 // consider section active when >55% visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const link = linkById[id];
            if (!link) return;

            if (entry.isIntersecting) {
                // add active to the currently intersecting link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // accessibility: set aria-current on active link and remove from others
                navLinks.forEach(l => l.removeAttribute('aria-current'));
                link.setAttribute('aria-current', 'true');
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
    
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navList = document.querySelector('nav ul');
    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            const isOpen = navList.classList.toggle('show');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            // Position navList directly under the nav to avoid clipping on small screens
            try {
                const navEl = document.querySelector('nav');
                const navRect = navEl.getBoundingClientRect();
                // Use pageYOffset to compute absolute position relative to document
                const top = navRect.bottom + 8 + window.pageYOffset;
                navList.style.top = (navRect.height + 8) + 'px';
            } catch (e) {
                // ignore if nav not found
            }
        });

        // Close nav when a link is clicked (mobile)
        navList.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a) return;

            // Close the mobile menu immediately
            navList.classList.remove('show');
            navToggle.setAttribute('aria-expanded', 'false');

            // If it's an in-page link, smooth scroll with offset for the fixed nav
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const id = href.slice(1);
                const target = document.getElementById(id);
                if (target) {
                    // compute offset to account for fixed nav height
                    const navEl = document.querySelector('nav');
                    const offset = navEl ? navEl.getBoundingClientRect().height : 0;
                    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset - 8;
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                    // update the URL hash without jumping
                    history.pushState(null, '', '#' + id);
                }
            }
        });
    }

    // Ensure navList top is recalculated on resize/orientation change
    window.addEventListener('resize', () => {
        const navEl = document.querySelector('nav');
        if (navEl && navList) {
            const navRect = navEl.getBoundingClientRect();
            navList.style.top = (navRect.height + 8) + 'px';
        }
    });
});
