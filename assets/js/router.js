var PAGE_PATHS = {
    'home': '/',
    'contact': '/contact',
    'invitations': '/tenders/invitations'
  };
  var PATH_PAGES = {
    '': 'home',
    '/': 'home',
    '/contact': 'contact',
    '/tenders/invitations': 'invitations'
  };

  function normalizePath(p) {
    // Strip a trailing "index.html", trailing ".html", and trailing slash
    // so /tenders/invitations/, /tenders/invitations/index.html and
    // /tenders/invitations.html all resolve the same as /tenders/invitations
    p = p.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    if (p.length > 1) p = p.replace(/\/$/, '');
    return p;
  }

  // Some environments (e.g. a preview loaded via srcdoc/about:blank, or a
  // page opened as a local file) don't allow the URL to be rewritten with
  // pushState/replaceState. Fail silently there instead of throwing.
  function safePushState(state, path) {
    try { history.pushState(state, '', path); } catch (err) { /* not supported here, ignore */ }
  }
  function safeReplaceState(state, path) {
    try { history.replaceState(state, '', path); } catch (err) { /* not supported here, ignore */ }
  }

  function showPage(name, updateHistory) {
    document.documentElement.setAttribute('data-route', name);
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (name === 'home') {
      document.querySelector('.nav-links a[onclick*="home"]').classList.add('active');
    } else if (name === 'contact') {
      document.querySelector('.nav-links a[onclick*="contact"]').classList.add('active');
    }
    if (updateHistory !== false) {
      var path = PAGE_PATHS[name] || '/';
      if (normalizePath(window.location.pathname) !== path) {
        safePushState({ page: name }, path);
      }
    }
    closeMobileNav();
    window.scrollTo(0, 0);
  }

  window.addEventListener('popstate', function(e) {
    var name = (e.state && e.state.page) || PATH_PAGES[normalizePath(window.location.pathname)] || 'home';
    showPage(name, false);
  });

  document.addEventListener('DOMContentLoaded', function() {
    var initial = PATH_PAGES[normalizePath(window.location.pathname)];
    if (initial && initial !== 'home') {
      showPage(initial, false);
      safeReplaceState({ page: initial }, PAGE_PATHS[initial]);
    } else {
      safeReplaceState({ page: 'home' }, PAGE_PATHS['home']);
    }
  });
