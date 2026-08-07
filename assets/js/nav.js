  function toggleMobileNav() {
    document.getElementById('navLinks').classList.toggle('open');
    document.getElementById('hamburgerBtn').classList.toggle('open');
  }
  function closeMobileNav() {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburgerBtn').classList.remove('open');
    document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
  }

  // Dropdown triggers: on mobile, tapping expands/collapses the mega menu instead of navigating
  document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth <= 900) {
        const item = trigger.closest('.nav-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      }
    });
  });
  // Close mobile menu when a leaf nav link is tapped (not the dropdown triggers themselves)
  document.querySelectorAll('.nav-links a:not(.dropdown-trigger)').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeMobileNav();
    });
  });
  // Desktop: clicking a mega-menu submenu link closes that dropdown right away,
  // instead of it staying open just because the mouse is still hovering.
  document.querySelectorAll('.mega-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth > 900) {
        const item = link.closest('.nav-item');
        if (item) {
          item.classList.add('force-hide');
          item.classList.remove('open');
          const clear = () => {
            item.classList.remove('force-hide');
            item.removeEventListener('mouseleave', clear);
          };
          item.addEventListener('mouseleave', clear);
        }
      }
    });
  });
