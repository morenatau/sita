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
  // Desktop: a mega-menu naturally opens flush with its own trigger's left edge,
  // but for triggers near the right end of the nav bar that would push it off
  // the edge of the viewport — nudge it left just enough to stay inside the
  // nav bar (never past the trigger's own left edge, so it never runs off left either).
  document.querySelectorAll('.nav-item').forEach(item => {
    const menu = item.querySelector('.mega-menu');
    if (!menu) return;
    item.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 900) return;
      menu.style.left = '0px';
      requestAnimationFrame(() => {
        const navRect = document.querySelector('.navbar-inner').getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        let desiredLeft = Math.min(itemRect.left, navRect.right - menuRect.width);
        desiredLeft = Math.max(desiredLeft, navRect.left);
        menu.style.left = (desiredLeft - itemRect.left) + 'px';
      });
    });
    item.addEventListener('mouseleave', () => {
      menu.style.left = '';
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
