const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  mobileNav.hidden = isOpen;
  document.body.classList.toggle('menu-open', !isOpen);
});

mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

const header = document.querySelector('.site-header');
const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.intro-main, .research-card, .project-card, .person, .pub-card, .story-main').forEach(element => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

const methodBook = document.querySelector('[data-method-book]');
if (methodBook) {
  const steps = [
    ['Build the reference', 'Normal photos become feature maps; sampled patches form the reference.', 'Normal metal surface photos becoming a reference bank of visual patches'],
    ['Prepare the photo', 'Resize, convert to grayscale, and normalize brightness.', 'A real metal surface photo before and after preparation'],
    ['Split into patches', 'Examine small areas across the surface.', 'A metal surface photo divided into small patches'],
    ['Measure features', 'Capture brightness, dark gaps, and edges.', 'Visual features measured from a surface patch'],
    ['Find the nearest normal patch', 'Score each patch by its closest normal match.', 'Surface patches compared with a normal reference'],
    ['Map anomalies', 'Map patch scores and flag photos above the threshold.', 'Anomaly highlights over a real metal surface photo']
  ];
  const assetRoot = './assets/surface-trace/';
  const page = methodBook.querySelector('[data-method-page]');
  const image = methodBook.querySelector('[data-method-image]');
  const count = methodBook.querySelector('[data-method-count]');
  const stepLabel = methodBook.querySelector('[data-method-step]');
  const heading = methodBook.querySelector('[data-method-heading]');
  const description = methodBook.querySelector('[data-method-description]');
  const playButton = methodBook.querySelector('[data-method-play]');
  const jumpButtons = [...methodBook.querySelectorAll('[data-method-jump]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let visible = false;
  let paused = false;
  let turning = false;
  let pendingIndex = null;
  let timer;

  const asset = (index, extension) => `${assetRoot}${String(index + 1).padStart(2, '0')}${extension}`;

  function showStep(index) {
    current = index;
    const number = String(index + 1).padStart(2, '0');
    count.textContent = `${number} / 06`;
    stepLabel.textContent = `STEP ${number}`;
    heading.textContent = steps[index][0];
    description.textContent = steps[index][1];
    image.alt = steps[index][2];
    image.src = asset(index, '-poster.png');
    if (visible && !paused && !reducedMotion.matches) {
      requestAnimationFrame(() => {
        if (current === index && visible && !paused) image.src = asset(index, '.gif');
      });
    }
    jumpButtons.forEach((button, buttonIndex) => {
      if (buttonIndex === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  function scheduleNext() {
    clearTimeout(timer);
    if (visible && !paused && !reducedMotion.matches && !document.hidden) {
      timer = setTimeout(() => {
        turnTo((current + 1) % steps.length);
      }, 3600);
    }
  }

  function turnTo(index) {
    if (turning) {
      pendingIndex = index;
      return;
    }
    if (index === current) return;
    clearTimeout(timer);
    if (reducedMotion.matches) {
      showStep(index);
      return;
    }
    turning = true;
    page.classList.add('is-turning-out');
    setTimeout(() => {
      showStep(index);
      page.classList.remove('is-turning-out');
      page.classList.add('is-turning-in');
      void page.offsetWidth;
      requestAnimationFrame(() => {
        page.classList.remove('is-turning-in');
        setTimeout(() => {
          turning = false;
          if (pendingIndex !== null) {
            const nextIndex = pendingIndex;
            pendingIndex = null;
            turnTo(nextIndex);
          } else scheduleNext();
        }, 360);
      });
    }, 340);
  }

  methodBook.querySelector('[data-method-prev]').addEventListener('click', () => turnTo((current - 1 + steps.length) % steps.length));
  methodBook.querySelector('[data-method-next]').addEventListener('click', () => turnTo((current + 1) % steps.length));
  jumpButtons.forEach(button => button.addEventListener('click', () => turnTo(Number(button.dataset.methodJump))));
  methodBook.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      turnTo((current + (event.key === 'ArrowRight' ? 1 : -1) + steps.length) % steps.length);
    }
  });
  playButton.addEventListener('click', () => {
    paused = !paused;
    playButton.setAttribute('aria-pressed', String(paused));
    playButton.setAttribute('aria-label', paused ? 'Play SurfaceTrace animation' : 'Pause SurfaceTrace animation');
    playButton.firstChild.textContent = paused ? 'PLAY ' : 'PAUSE ';
    playButton.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    showStep(current);
    scheduleNext();
  });
  if ('IntersectionObserver' in window) {
    const bookObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      showStep(current);
      scheduleNext();
    }, { threshold: 0.15 });
    bookObserver.observe(methodBook);
  } else {
    visible = true;
    showStep(current);
    scheduleNext();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
    else scheduleNext();
  });
  reducedMotion.addEventListener('change', () => {
    showStep(current);
    scheduleNext();
  });
}
