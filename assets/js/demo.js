// Illustrative "plan to quote" demo. Pure DOM, no dependencies, no network.
(() => {
  const demos = Array.from(document.querySelectorAll('[data-demo]'));
  if (!demos.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STEPS = [
    { at: 0, label: 'Reading the brief' },
    { at: 900, label: 'Matching past jobs' },
    { at: 2100, label: 'Building line items' },
    { at: 3400, label: 'Ready' },
  ];

  demos.forEach((demo) => {
    const status = demo.querySelector('[data-demo-status]');
    const replay = demo.querySelector('[data-demo-replay]');
    const doneLabel = demo.dataset.demoDone || 'Ready';
    const labels = STEPS.map((step, i) => (i === 3 ? doneLabel : step.label));
    let timers = [];
    let loop = null;

    const setStep = (n) => {
      demo.dataset.step = String(n);
      if (status) status.textContent = labels[n];
    };

    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };

    const play = () => {
      clear();
      setStep(0);
      STEPS.slice(1).forEach((step, index) => {
        timers.push(window.setTimeout(() => setStep(index + 1), step.at));
      });
    };

    if (reduce) {
      setStep(3);
      if (replay) replay.hidden = true;
      return;
    }

    play();

    if (replay) {
      replay.addEventListener('click', () => {
        if (loop) window.clearInterval(loop);
        play();
        startLoop();
      });
    }

    const startLoop = () => {
      if (loop) window.clearInterval(loop);
      loop = window.setInterval(() => {
        if (document.hidden) return;
        play();
      }, 9000);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startLoop();
            } else if (loop) {
              window.clearInterval(loop);
              loop = null;
            }
          });
        },
        { threshold: 0.25 },
      );
      io.observe(demo);
    } else {
      startLoop();
    }
  });
})();
