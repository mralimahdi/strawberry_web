// js/scrollbar.js
// Usage: Place <div id="scrollbar-include"></div> where you want the scroll controls.
// Then include this script at the end of <body>.
(function() {
  const target = document.getElementById('scrollbar-include');
  if (!target) return;
  fetch('/scrollbar.html')
    .then(res => res.text())
    .then(html => {
      target.innerHTML = html;
      // After injection, run the scroll logic
      setupScrollDiskBar();
    });

  function setupScrollDiskBar() {
    // --- BEGIN: Home page scroll disk bar logic (simplified for all pages) ---
    const sideDiskBar = document.getElementById('sideDiskBar');
    const sectionHeight = window.innerHeight;
    let diskY1 = 40, diskY2 = 300, diskLen = diskY2 - diskY1;
    function updateSideDiskIndicator() {
      let percent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      percent = Math.max(0, Math.min(1, percent));
      const y2 = diskY1 + diskLen * percent;
      if (sideDiskBar) sideDiskBar.setAttribute('y2', y2);
    }
    window.addEventListener('scroll', updateSideDiskIndicator);
    window.addEventListener('resize', updateSideDiskIndicator);
    updateSideDiskIndicator();

    // Scroll button logic
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const scrollText = document.querySelector('.scroll-text');
    let scrollIndicatorUp = false;
    function setScrollIndicatorUp(isUp) {
      scrollIndicatorUp = isUp;
      if (scrollText) scrollText.textContent = isUp ? 'Scroll Up' : 'Scroll';
      const arrow = document.getElementById('rippleArrow');
      if (arrow) {
        arrow.setAttribute('points', isUp ? '27,34 33,34 30,28' : '27,30 33,30 30,36');
      }
    }
    function updateScrollIndicatorDirection() {
      setScrollIndicatorUp(window.scrollY > (document.body.scrollHeight - window.innerHeight - 10));
    }
    window.addEventListener('scroll', updateScrollIndicatorDirection);
    updateScrollIndicatorDirection();
    if (scrollIndicator) {
      scrollIndicator.onclick = function() {
        if (scrollIndicatorUp) window.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      };
    }
  }
})();
