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

const thoughtButton = document.querySelector('[data-thought-next]');
if (thoughtButton) {
  const thoughtLine = document.querySelector('[data-thought-line]');
  const thoughts = [
    'One image can spark a question.<br />One question can open a new direction.',
    'Look a little closer.<br />The next idea may already be in the frame.',
    'Different minds, one view.<br />Then another view entirely.'
  ];
  let thoughtIndex = 0;
  thoughtButton.addEventListener('click', () => {
    thoughtIndex = (thoughtIndex + 1) % thoughts.length;
    thoughtLine.innerHTML = thoughts[thoughtIndex];
  });
}

const diary = document.querySelector('[data-diary]');
if (diary) {
  const photos = [...diary.querySelectorAll('[data-diary-photo]')];
  const count = diary.querySelector('[data-diary-count]');
  const progress = diary.querySelector('[data-diary-progress]');
  const source = document.querySelector('[data-diary-source]');
  const sources = [
    'https://x.com/nctwishofficial/status/1910709630155842032',
    'https://x.com/nctwishofficial/status/1837145025379193309',
    'https://x.com/nctwishofficial/status/2038632468199477453/photo/4'
  ];
  const sourceLabels = ['poppop', 'Steady', 'Ode to Love'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 5500;
  let index = 0;
  let visible = false;
  let paused = false;
  let timer;

  function stopDiaryTimer() {
    clearTimeout(timer);
    progress.style.transition = 'none';
    progress.style.width = '0%';
  }

  function startDiaryTimer() {
    stopDiaryTimer();
    if (!visible || paused || document.hidden || reducedMotion.matches) return;
    requestAnimationFrame(() => {
      if (!visible || paused || document.hidden || reducedMotion.matches) return;
      progress.style.transition = `width ${duration}ms linear`;
      progress.style.width = '100%';
      timer = setTimeout(() => showDiaryPhoto(index + 1), duration);
    });
  }

  function showDiaryPhoto(nextIndex) {
    index = (nextIndex + photos.length) % photos.length;
    photos.forEach((photo, photoIndex) => photo.classList.toggle('is-active', photoIndex === index));
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    source.href = sources[index];
    source.textContent = `${sourceLabels[index]} / NCT WISH OFFICIAL ↗`;
    startDiaryTimer();
  }

  diary.querySelector('[data-diary-prev]').addEventListener('click', () => showDiaryPhoto(index - 1));
  diary.querySelector('[data-diary-next]').addEventListener('click', () => showDiaryPhoto(index + 1));
  diary.addEventListener('mouseenter', () => { paused = true; stopDiaryTimer(); });
  diary.addEventListener('mouseleave', () => { paused = false; startDiaryTimer(); });
  diary.addEventListener('focusin', () => { paused = true; stopDiaryTimer(); });
  diary.addEventListener('focusout', event => {
    if (diary.contains(event.relatedTarget)) return;
    paused = false;
    startDiaryTimer();
  });
  document.addEventListener('visibilitychange', startDiaryTimer);
  reducedMotion.addEventListener('change', startDiaryTimer);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      startDiaryTimer();
    }, { threshold: 0.25 }).observe(diary);
  } else {
    visible = true;
    startDiaryTimer();
  }
}

const heroImage = document.querySelector('.hero-image');
if (heroImage && window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  heroImage.addEventListener('pointermove', event => {
    const bounds = heroImage.getBoundingClientRect();
    heroImage.style.setProperty('--hero-x', `${((event.clientX - bounds.left) / bounds.width - .5) * -10}px`);
    heroImage.style.setProperty('--hero-y', `${((event.clientY - bounds.top) / bounds.height - .5) * -10}px`);
  });
  heroImage.addEventListener('pointerleave', () => {
    heroImage.style.setProperty('--hero-x', '0px');
    heroImage.style.setProperty('--hero-y', '0px');
  });
}

const visualBreak = document.querySelector('.visual-break');
if (visualBreak) {
  const lookButton = visualBreak.querySelector('[data-look-again]');
  const pointerFine = window.matchMedia('(pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const centerLens = () => {
    visualBreak.style.setProperty('--lens-x', '66%');
    visualBreak.style.setProperty('--lens-y', '48%');
  };
  lookButton.addEventListener('click', () => {
    const looking = visualBreak.classList.toggle('is-looking');
    lookButton.setAttribute('aria-pressed', String(looking));
    lookButton.setAttribute('aria-label', looking ? 'Hide the closer look at the star collage' : 'Reveal a closer look at the star collage');
    centerLens();
  });
  visualBreak.addEventListener('pointermove', event => {
    if (!visualBreak.classList.contains('is-looking') || !pointerFine.matches || reducedMotion.matches) return;
    const bounds = visualBreak.getBoundingClientRect();
    visualBreak.style.setProperty('--lens-x', `${event.clientX - bounds.left}px`);
    visualBreak.style.setProperty('--lens-y', `${event.clientY - bounds.top}px`);
  });
  visualBreak.addEventListener('pointerleave', centerLens);
}

const pixelQuest = document.querySelector('[data-pixel-quest]');
if (pixelQuest) {
  const target = pixelQuest.querySelector('[data-pixel-target]');
  const board = pixelQuest.querySelector('.pixel-board');
  const scoreLabel = pixelQuest.querySelector('[data-pixel-score]');
  const status = pixelQuest.querySelector('[data-pixel-status]');
  const playAgain = pixelQuest.querySelector('[data-pixel-play-again]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const positions = [[2, 2], [6, 1], [4, 3], [1, 1], [7, 2], [3, 1], [5, 3]];
  const moveIntervals = [780, 560, 400];
  const messages = ['ONE SIGNAL FOUND. SPEEDING UP!', 'TWO SIGNALS FOUND. EVEN FASTER!', 'NEW PERSPECTIVE UNLOCKED ✦'];
  let positionIndex = 0;
  let score = 0;
  let visible = false;
  let interval;

  function moveSignal() {
    positionIndex = (positionIndex + 1) % positions.length;
    target.style.gridColumn = positions[positionIndex][0];
    target.style.gridRow = positions[positionIndex][1];
  }

  function updateSignalMotion() {
    clearInterval(interval);
    if (visible && !document.hidden && !reducedMotion.matches && score < 3) {
      interval = setInterval(moveSignal, moveIntervals[score]);
    }
  }

  target.addEventListener('click', () => {
    if (score === 3) return;
    score += 1;
    scoreLabel.textContent = `${String(score).padStart(2, '0')} / 03`;
    status.textContent = messages[score - 1];
    if (score === 3) {
      target.hidden = true;
      board.classList.add('is-cleared');
      playAgain.hidden = false;
    } else moveSignal();
    updateSignalMotion();
  });
  playAgain.addEventListener('click', () => {
    score = 0;
    scoreLabel.textContent = '00 / 03';
    status.textContent = 'READY? FIND THE FIRST STAR.';
    target.hidden = false;
    board.classList.remove('is-cleared');
    playAgain.hidden = true;
    moveSignal();
    updateSignalMotion();
    target.focus();
  });
  document.addEventListener('visibilitychange', updateSignalMotion);
  reducedMotion.addEventListener('change', updateSignalMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      updateSignalMotion();
    }, { threshold: .3 }).observe(pixelQuest);
  } else {
    visible = true;
    updateSignalMotion();
  }
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
  const motionImage = methodBook.querySelector('[data-method-motion]');
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
  let targetIndex = 0;
  let runToken = 0;
  let timer;

  const asset = (index, extension) => `${assetRoot}${String(index + 1).padStart(2, '0')}${extension}`;
  const posterReady = steps.map((_, index) => {
    const poster = new Image();
    poster.src = asset(index, '-poster.png');
    return poster.decode().catch(() => {});
  });

  function waitForPageFade() {
    if (reducedMotion.matches) return Promise.resolve();
    return new Promise(resolve => {
      let finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        page.removeEventListener('transitionend', onTransitionEnd);
        clearTimeout(fallback);
        resolve();
      }
      function onTransitionEnd(event) {
        if (event.target === page && event.propertyName === 'opacity') finish();
      }
      page.addEventListener('transitionend', onTransitionEnd);
      const fallback = setTimeout(finish, 320);
    });
  }

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
    motionImage.onload = null;
    motionImage.onerror = null;
    motionImage.classList.remove('is-ready');
    motionImage.removeAttribute('src');
    progress.style.transition = 'none';
    progress.style.width = '0%';
  }

  function startPlayback() {
    stopPlayback();
    if (turning) return;
    image.src = asset(current, '-poster.png');
    if (!visible || document.hidden || reducedMotion.matches) return;

    const token = runToken;
    const index = current;
    const duration = steps[index][3] * 2;
    requestAnimationFrame(() => {
      if (token !== runToken || !visible || document.hidden) return;
      motionImage.onload = () => {
        if (token !== runToken || !motionImage.currentSrc.endsWith('.gif')) return;
        motionImage.onload = null;
        motionImage.classList.add('is-ready');
        requestAnimationFrame(() => {
          if (token !== runToken) return;
          progress.style.transition = `width ${duration}ms linear`;
          progress.style.width = '100%';
          timer = setTimeout(() => {
            if (token === runToken) turnTo((index + 1) % steps.length);
          }, duration);
        });
      };
      motionImage.onerror = () => {
        if (token !== runToken) return;
        motionImage.onerror = null;
        timer = setTimeout(() => {
          if (token === runToken) turnTo((index + 1) % steps.length);
        }, duration);
      };
      motionImage.src = asset(index, '.gif');
    });
  }

  async function turnTo(index) {
    if (turning) {
      pendingIndex = index;
      return;
    }
    if (index === current) return;
    targetIndex = index;
    stopPlayback();
    if (reducedMotion.matches) {
      renderStep(index);
      return;
    }
    turning = true;
    const fadeOut = waitForPageFade();
    page.classList.add('is-switching');
    await fadeOut;
    if (pendingIndex !== null) {
      index = pendingIndex;
      pendingIndex = null;
      targetIndex = index;
    }
    await posterReady[index];
    renderStep(index);
    await image.decode().catch(() => {});
    await new Promise(resolve => requestAnimationFrame(resolve));
    const fadeIn = waitForPageFade();
    page.classList.remove('is-switching');
    await fadeIn;
    turning = false;
    if (pendingIndex !== null) {
      const nextIndex = pendingIndex;
      pendingIndex = null;
      if (nextIndex !== current) turnTo(nextIndex);
      else startPlayback();
    } else startPlayback();
  }

  function navigate(delta) {
    const base = turning ? (pendingIndex ?? targetIndex) : current;
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
