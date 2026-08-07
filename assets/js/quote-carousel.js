(function() {
    const track = document.getElementById('quoteTrack');
    const dots = document.querySelectorAll('#quoteDots span');
    const total = dots.length;
    let current = 1; // TechnoGirl slide is default active
    let timer;

    function show(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(d => d.classList.remove('active'));
      dots[current].classList.add('active');
    }

    window.quoteGo = function(index) {
      show(index);
      restartTimer();
    };
    function restartTimer() {
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), 7000);
    }
    show(current);
    restartTimer();
  })();
