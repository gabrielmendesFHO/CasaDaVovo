export function initializeCarousel(carousel) {
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const indicators = [...carousel.querySelectorAll('[data-slide]')];
  const previous = carousel.querySelector('.carousel-previous');
  const next = carousel.querySelector('.carousel-next');
  const playback = carousel.querySelector('.carousel-playback');
  const status = carousel.querySelector('.carousel-status');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = motion.matches;
  let hovered = false;
  let focused = false;
  let timer;
  let pointerStart;

  function showSlide(target, announce = true) {
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    indicators.forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    carousel.dataset.activeSlide = index;
    if (announce) status.textContent = `Foto ${index + 1} de ${slides.length}: ${slides[index].querySelector('img').alt}`;
  }

  function syncPlayback() {
    clearInterval(timer);
    playback.setAttribute('aria-label', paused ? 'Reproduzir carrossel' : 'Pausar carrossel');
    playback.setAttribute('aria-pressed', String(paused));
    playback.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    if (!paused && !hovered && !focused && !document.hidden) {
      timer = setInterval(() => showSlide(index + 1, false), 6000);
    }
  }

  function navigate(target) {
    showSlide(target);
    syncPlayback();
  }

  previous.addEventListener('click', () => navigate(index - 1));
  next.addEventListener('click', () => navigate(index + 1));
  indicators.forEach(button => button.addEventListener('click', () => navigate(Number(button.dataset.slide))));
  playback.addEventListener('click', () => {
    paused = !paused;
    syncPlayback();
  });
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    navigate(index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    syncPlayback();
  });
  carousel.addEventListener('pointerleave', () => {
    hovered = false;
    syncPlayback();
  });
  carousel.addEventListener('focusin', () => {
    focused = true;
    syncPlayback();
  });
  carousel.addEventListener('focusout', event => {
    focused = carousel.contains(event.relatedTarget);
    syncPlayback();
  });
  carousel.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.target.closest('button')) return;
    pointerStart = {id: event.pointerId, x: event.clientX, y: event.clientY};
  });
  carousel.addEventListener('pointerup', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)) navigate(index + (dx < 0 ? 1 : -1));
  });
  carousel.addEventListener('pointercancel', () => { pointerStart = null; });
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', event => {
    if (event.matches) paused = true;
    syncPlayback();
  });
  syncPlayback();
}
