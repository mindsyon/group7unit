/* ════════════════════════════════════════
   Material World — Unit 7
   main.js
════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── READING PROGRESS BAR ──────────────────────────────────
  const progressBar = document.getElementById('progress');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });


  // ── SCROLL REVEAL ─────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObs.observe(el));


  // ── SLIDE VIEWER ──────────────────────────────────────────
  const TOTAL     = 11;
  const slideMeta = [
    { k: 'Cover',                   n: 'Material World'         },
    { k: 'Overview',                n: 'Contents'               },
    { k: 'Lesson 7.1 · Vocabulary', n: 'Materials & adjectives' },
    { k: 'Lesson 7.2 · Grammar',    n: 'Present Simple passive' },
    { k: 'Lesson 7.3 · Grammar',    n: 'Past Simple passive'    },
    { k: 'Lesson 7.4 · Communication', n: 'Asking for clarification' },
    { k: 'Lesson 7.5 · Reading',    n: 'Beautiful things'       },
    { k: 'Lesson 7.6 · Listening',  n: 'Technology verbs'       },
    { k: 'Lesson 7.7 · Writing',    n: 'Describing a product'   },
    { k: 'Lesson 7.8 · Self-check', n: 'Revision summary'       },
    { k: 'End of unit',             n: 'Material World'         },
  ];

  let cur        = 1;
  const slideImg = document.getElementById('slideImg');
  const curNum   = document.getElementById('curNum');
  const kicker   = document.getElementById('slideKicker');
  const slideName= document.getElementById('slideName');
  const dlBtn    = document.getElementById('dlBtn');
  const thumbsEl = document.getElementById('thumbs');

  // build thumbnails
  for (let i = 1; i <= TOTAL; i++) {
    const t    = document.createElement('img');
    t.src      = `slides/slide-${i}.jpg`;
    t.alt      = `Slide ${i}`;
    t.dataset.i = i;
    t.addEventListener('click', () => go(i));
    thumbsEl.appendChild(t);
  }

  function go(i) {
    cur = i < 1 ? TOTAL : i > TOTAL ? 1 : i;

    slideImg.classList.add('fading');
    setTimeout(() => {
      slideImg.src = `slides/slide-${cur}.jpg`;
      slideImg.alt = `Slide ${cur}`;
      slideImg.classList.remove('fading');
    }, 180);

    curNum.textContent    = cur;
    kicker.textContent    = slideMeta[cur - 1].k;
    slideName.textContent = slideMeta[cur - 1].n;
    dlBtn.href            = `slides/slide-${cur}.jpg`;
    dlBtn.setAttribute('download', `material-world-slide-${cur}.jpg`);

    [...thumbsEl.children].forEach(c => c.classList.toggle('active', +c.dataset.i === cur));
    thumbsEl.children[cur - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  document.getElementById('prevBtn').addEventListener('click', () => go(cur - 1));
  document.getElementById('nextBtn').addEventListener('click', () => go(cur + 1));

  // keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });

  // touch swipe
  let touchStartX = 0;
  const stage = document.getElementById('stage');
  stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // fullscreen
  document.getElementById('fsBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) stage.requestFullscreen?.();
    else document.exitFullscreen();
  });

  go(1);


  // ── NAV ACTIVE STATE ──────────────────────────────────────
  const navLinks = [...document.querySelectorAll('nav.toc a')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));

  const navObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const id = '#' + en.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(s => s && navObs.observe(s));


  // ── READING TABS ──────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });


  // ── MINI QUIZ ─────────────────────────────────────────────
  function initQuiz(quizId) {
    const quiz    = document.getElementById(quizId);
    const items   = [...quiz.querySelectorAll('.q-item')];
    const scoreEl = document.getElementById(quizId + '-score');
    const resetBtn= document.getElementById(quizId + '-reset');
    let answered  = 0;
    let correct   = 0;

    items.forEach(item => {
      const answer = +item.dataset.answer;
      const opts   = [...item.querySelectorAll('.q-opt')];
      const feedback = item.querySelector('.q-feedback');

      opts.forEach(opt => {
        opt.addEventListener('click', () => {
          if (opt.classList.contains('locked') ||
              opt.classList.contains('correct') ||
              opt.classList.contains('wrong')) return;

          const chosen = +opt.dataset.i;
          opts.forEach(o => o.classList.add('locked'));

          if (chosen === answer) {
            opt.classList.add('correct');
            feedback.textContent  = '✓ Correct!';
            feedback.style.color  = '#5a9a7a';
            correct++;
          } else {
            opt.classList.add('wrong');
            opts[answer].classList.remove('locked');
            opts[answer].classList.add('correct');
            feedback.textContent  = '✗ Not quite — see the correct answer above.';
            feedback.style.color  = '#b06a4a';
          }

          answered++;
          if (answered === items.length) {
            scoreEl.style.display  = 'block';
            scoreEl.textContent    = `${correct} / ${items.length} correct`;
            resetBtn.style.display = 'block';
          }
        });
      });
    });

    resetBtn.addEventListener('click', () => {
      answered = 0;
      correct  = 0;
      items.forEach(item => {
        item.querySelectorAll('.q-opt').forEach(o => o.className = 'q-opt');
        item.querySelector('.q-feedback').textContent = '';
      });
      scoreEl.style.display  = 'none';
      resetBtn.style.display = 'none';
    });
  }

  initQuiz('quiz1');
  initQuiz('quiz2');


  // ── PRACTICE CHECKLIST ────────────────────────────────────
  const todos        = [...document.querySelectorAll('.todo')];
  const progressFill = document.getElementById('progressFill');
  const progressLabel= document.getElementById('progressLabel');

  function updateProgress() {
    const done = todos.filter(t => t.classList.contains('done')).length;
    progressFill.style.width   = (done / todos.length * 100) + '%';
    progressLabel.textContent  = `${done} of ${todos.length} complete`;
  }

  todos.forEach(t => {
    t.addEventListener('click', () => {
      t.classList.toggle('done');
      updateProgress();
    });
  });

  updateProgress();

});
