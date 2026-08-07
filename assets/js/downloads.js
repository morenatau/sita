  function toggleDlMenu(btn) {
    const menu = btn.nextElementSibling;
    const wasOpen = menu.classList.contains('open');
    document.querySelectorAll('.dl-menu.open').forEach(m => m.classList.remove('open'));
    if (!wasOpen) menu.classList.add('open');
  }

  function downloadAllFiles(el) {
    const menu = el.closest('.dl-menu');
    const links = menu.querySelectorAll('a.dl-file');
    links.forEach((link, i) => {
      setTimeout(() => link.click(), i * 350);
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dl-cell')) {
      document.querySelectorAll('.dl-menu.open').forEach(m => m.classList.remove('open'));
    }
  });
