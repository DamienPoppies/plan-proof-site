// Small, dependency-free enhancements. The site works without this file.
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  const onScroll = () => {
    if (!header) return;
    header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });

    mobileNav.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest('a')) return;
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    });
  }

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((node) => {
      node.dataset.visible = 'true';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.visible = 'true';
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  reveals.forEach((node) => observer.observe(node));
})();
