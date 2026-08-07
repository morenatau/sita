(function() {
    const slides = document.querySelectorAll('#heroSlides .hero-slide');
    const dots = document.querySelectorAll('#heroDots span');
    let current = 0;
    let timer;

    function show(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    window.heroMove = function(delta) {
      show(current + delta);
      restartTimer();
    };
    window.heroGo = function(index) {
      show(index);
      restartTimer();
    };
    function restartTimer() {
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), 6000);
    }
    restartTimer();
  })();
