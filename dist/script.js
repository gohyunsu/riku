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
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

const header = document.querySelector('.site-header');
const progressFill = document.querySelector('.site-progress span');
const trackedSections = [...document.querySelectorAll('main > section[id]:not(#top)')];
const sectionLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
let scrollUpdatePending = false;

function updatePagePosition() {
  scrollUpdatePending = false;
  header.classList.toggle('scrolled', window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progressFill.style.transform = `scaleX(${progress})`;

  const marker = window.scrollY + header.offsetHeight + window.innerHeight * 0.28;
  const current = [...trackedSections].reverse().find(section => section.offsetTop <= marker)?.id;
  sectionLinks.forEach(link => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function schedulePagePositionUpdate() {
  if (scrollUpdatePending) return;
  scrollUpdatePending = true;
  requestAnimationFrame(updatePagePosition);
}

window.addEventListener('scroll', schedulePagePositionUpdate, { passive: true });
window.addEventListener('resize', schedulePagePositionUpdate, { passive: true });
updatePagePosition();

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.intro-main, .research-card, .featured-project, .project-card, .person, .paper-card, .story-main').forEach(element => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

const questionBoard = document.querySelector('.project-board');
if (questionBoard) {
  const cards = [...questionBoard.querySelectorAll('.project-card')];
  const previous = document.querySelector('[data-question-prev]');
  const next = document.querySelector('[data-question-next]');
  const count = document.querySelector('[data-question-count]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let questionUpdatePending = false;

  function updateQuestionControls() {
    questionUpdatePending = false;
    const boardLeft = questionBoard.getBoundingClientRect().left;
    activeIndex = cards.reduce((nearest, card, index) =>
      Math.abs(card.getBoundingClientRect().left - boardLeft) < Math.abs(cards[nearest].getBoundingClientRect().left - boardLeft) ? index : nearest, 0);
    count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === cards.length - 1;
  }

  function scheduleQuestionUpdate() {
    if (questionUpdatePending) return;
    questionUpdatePending = true;
    requestAnimationFrame(updateQuestionControls);
  }

  function showQuestion(index) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, index))];
    const left = card.getBoundingClientRect().left - questionBoard.getBoundingClientRect().left + questionBoard.scrollLeft;
    questionBoard.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  previous.addEventListener('click', () => showQuestion(activeIndex - 1));
  next.addEventListener('click', () => showQuestion(activeIndex + 1));
  questionBoard.addEventListener('scroll', scheduleQuestionUpdate, { passive: true });
  window.addEventListener('resize', scheduleQuestionUpdate, { passive: true });
  updateQuestionControls();
}

const methodBook = document.querySelector('[data-method-book]');
if (methodBook) {
  const steps = [
    ['Build the reference', 'Normal photos form a reference bank.', 'Normal metal surface photos becoming a reference bank of visual patches', 2480],
    ['Prepare the photo', 'Resize and normalize the test photo.', 'A real metal surface photo before and after preparation', 2520],
    ['Split into patches', 'Examine small areas across the surface.', 'A metal surface photo divided into small patches', 2500],
    ['Measure features', 'Capture brightness, dark gaps, and edges.', 'Visual features measured from a surface patch', 2580],
    ['Find the nearest normal patch', 'Compare each patch with the reference.', 'Surface patches compared with a normal reference', 2570],
    ['Map anomalies', 'Highlight the areas worth reviewing.', 'Anomaly highlights over a real metal surface photo', 2490]
  ];
  const assetRoot = './assets/surface-trace/';
  const page = methodBook.querySelector('[data-method-page]');
  const image = methodBook.querySelector('[data-method-image]');
  const count = methodBook.querySelector('[data-method-count]');
  const stepLabel = methodBook.querySelector('[data-method-step]');
  const heading = methodBook.querySelector('[data-method-heading]');
  const description = methodBook.querySelector('[data-method-description]');
  const progress = methodBook.querySelector('[data-method-progress]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let visible = false;
  let turning = false;
  let pendingIndex = null;
  let runToken = 0;
  let timer;

  const asset = (index, extension) => `${assetRoot}${String(index + 1).padStart(2, '0')}${extension}`;

  function renderStep(index) {
    current = index;
    const number = String(index + 1).padStart(2, '0');
    count.textContent = `${number} / 06`;
    stepLabel.textContent = `STEP ${number}`;
    heading.textContent = steps[index][0];
    description.textContent = steps[index][1];
    image.alt = steps[index][2];
    image.src = asset(index, '-poster.png');
  }

  function stopPlayback() {
    clearTimeout(timer);
    runToken += 1;
    image.onload = null;
    image.onerror = null;
    progress.style.transition = 'none';
    progress.style.width = '0%';
  }

  function startPlayback() {
    stopPlayback();
    image.src = asset(current, '-poster.png');
    if (!visible || document.hidden || reducedMotion.matches || turning) return;

    const token = runToken;
    const index = current;
    const duration = steps[index][3] * 2;
    requestAnimationFrame(() => {
      if (token !== runToken || !visible || document.hidden) return;
      image.onload = () => {
        if (token !== runToken || !image.currentSrc.endsWith('.gif')) return;
        image.onload = null;
        requestAnimationFrame(() => {
          if (token !== runToken) return;
          progress.style.transition = `width ${duration}ms linear`;
          progress.style.width = '100%';
          timer = setTimeout(() => turnTo((current + 1) % steps.length), duration);
        });
      };
      image.onerror = () => {
        if (token !== runToken) return;
        image.onerror = null;
        image.src = asset(index, '-poster.png');
        timer = setTimeout(() => turnTo((current + 1) % steps.length), duration);
      };
      image.src = asset(index, '.gif');
    });
  }

  function turnTo(index) {
    if (turning) {
      pendingIndex = index;
      return;
    }
    if (index === current) return;
    stopPlayback();
    if (reducedMotion.matches) {
      renderStep(index);
      return;
    }
    turning = true;
    page.classList.add('is-switching');
    setTimeout(() => {
      renderStep(index);
      requestAnimationFrame(() => {
        page.classList.remove('is-switching');
        setTimeout(() => {
          turning = false;
          if (pendingIndex !== null) {
            const nextIndex = pendingIndex;
            pendingIndex = null;
            if (nextIndex !== current) turnTo(nextIndex);
            else startPlayback();
          } else startPlayback();
        }, 230);
      });
    }, 180);
  }

  function navigate(delta) {
    const base = turning && pendingIndex !== null ? pendingIndex : current;
    turnTo((base + delta + steps.length) % steps.length);
  }

  methodBook.querySelector('[data-method-prev]').addEventListener('click', () => navigate(-1));
  methodBook.querySelector('[data-method-next]').addEventListener('click', () => navigate(1));
  methodBook.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  if ('IntersectionObserver' in window) {
    const bookObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      startPlayback();
    }, { threshold: 0.3 });
    bookObserver.observe(methodBook);
  } else {
    visible = true;
    startPlayback();
  }
  document.addEventListener('visibilitychange', () => {
    startPlayback();
  });
  reducedMotion.addEventListener('change', startPlayback);
}
