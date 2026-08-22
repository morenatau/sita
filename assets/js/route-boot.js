  // Runs synchronously before the body is parsed/painted, so the correct
  // page is shown on first paint instead of flashing "home" and then
  // switching once the rest of the page's script runs.
  (function () {
    function normalizePath(p) {
      p = p.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
      if (p.length > 1) p = p.replace(/\/$/, '');
      return p;
    }
    var PATH_PAGES = {
      '': 'home',
      '/': 'home',
      '/contact': 'contact',
      '/tenders/invitations': 'invitations',
      '/tenders/submit': 'submit',
      '/admin': 'admin',
      '/about/vision-mission-values': 'vision-mission-values',
      '/about/sitas-legacy': 'sitas-legacy',
      '/about/corporate-profile': 'corporate-profile',
      '/about/mandate': 'mandate',
      '/about/acts-legislation': 'acts-legislation',
      '/about/commitment-to-customers': 'commitment-to-customers',
      '/about/sitas-customers': 'sitas-customers',
      '/about/shareholder': 'shareholder'
    };
    var route = PATH_PAGES[normalizePath(window.location.pathname)] || 'home';
    document.documentElement.setAttribute('data-route', route);
  })();
