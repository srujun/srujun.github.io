(() => {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  const overlay = document.getElementById('mobile-menu');

  // Mobile menu toggle
  if (toggle && overlay) {
    const closeMenu = () => {
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.hidden = true;
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      overlay.hidden = false;
      requestAnimationFrame(() => {
        toggle.classList.add('is-active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
      });
    };

    toggle.addEventListener('click', () => {
      if (overlay.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  // Subtle auto-hide header on scroll down, reveal on scroll up
  if (header) {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      const menuOpen = document.body.classList.contains('menu-open');

      if (!menuOpen && y > 80 && y > lastY + 4) {
        header.classList.add('is-hidden');
      } else if (y < lastY - 4 || y <= 80) {
        header.classList.remove('is-hidden');
      }

      lastY = y;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
  }
})();
