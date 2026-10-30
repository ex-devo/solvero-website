/* Homepage reading cues. Only JavaScript prepares hidden states; the static
   HTML remains readable without it. Completed reveals never reverse. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const groups = [
    ['#services > .container > h2', 'timed', 0.8],
    ['#services .service-card', 'timed', 0.7],
    ['.about-intro > h2', 'scroll', 0.8],
    ['.about-intro > p', 'scroll', 0.8],
    ['.about-intro > div', 'scroll', 0.8],
    ['.about-photo', 'scroll', 0.7],
    ['.about-details > div', 'scroll', 0.8],
    ['#expertise > .container > h2', 'timed', 0.8],
    ['.experience-media', 'scroll', 0.8],
    ['.experience-copy', 'scroll', 0.76],
    ['#technology .technology-item', 'wave', 0.75],
    ['#approach > .container > h2', 'timed', 0.8],
    ['#approach > .container > .grid > div', 'timed', 0.7],
  ].map(([selector, mode, start]) => [...document.querySelectorAll(selector)].map(element => ({
    element, mode, start, rise: mode === 'wave' ? 24 : 32,
    progress: 0, shift: 0, state: 'pending', animation: null,
  })));
  const records = groups.flat();
  const pending = new Set(records);
  let frame = null;

  function settle(record) {
    record.animation?.cancel();
    record.animation = null;
    record.element.style.removeProperty('opacity');
    record.element.style.removeProperty('transform');
    record.shift = 0;
    record.state = 'done';
    pending.delete(record);
  }

  function settleWithin(container) {
    if (!container) return;
    records.forEach(record => {
      if (container.contains(record.element) || record.element.contains(container)) settle(record);
    });
  }

  function play(record, delay) {
    pending.delete(record);
    record.state = 'playing';
    record.element.style.removeProperty('opacity');
    record.element.style.removeProperty('transform');
    record.shift = 0;
    const reduced = preference.matches;
    record.animation = record.element.animate(reduced
      ? [{ opacity: 0.75 }, { opacity: 1 }]
      : [{ opacity: 0, transform: `translateY(${record.rise}px)` }, { opacity: 1, transform: 'translateY(0)' }], {
      duration: reduced ? 120 : record.mode === 'wave' ? 600 : 700,
      delay: reduced ? 0 : delay,
      easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      fill: 'backwards',
    });
    record.animation.addEventListener('finish', () => settle(record), { once: true });
  }

  function update() {
    frame = null;
    // Batch geometry reads before writes. Subtract our own translation so the
    // scroll trigger follows layout rather than chasing the moving artwork.
    const tops = new Map([...pending].map(record => [record, record.element.getBoundingClientRect().top - record.shift]));
    const height = window.innerHeight;
    groups.forEach(group => {
      group.forEach(record => {
        if (!pending.has(record)) return;
        const top = tops.get(record);
        if (top < 0 || record.element.contains(document.activeElement)) {
          settle(record);
        } else if (record.mode === 'scroll' && !preference.matches) {
          const progress = Math.max(record.progress, Math.min(1, Math.max(0, (height * record.start - top) / (height * 0.25))));
          if (progress === 1) {
            settle(record);
          } else if (progress !== record.progress) {
            record.progress = progress;
            record.shift = 32 * (1 - progress);
            record.element.style.opacity = String(progress);
            record.element.style.transform = `translateY(${record.shift}px)`;
          }
        } else if (top <= height * record.start) {
          const row = group.filter(peer => tops.has(peer) && Math.abs(tops.get(peer) - top) < 8);
          play(record, row.indexOf(record) * (record.mode === 'wave' ? 90 : 200));
        }
      });
    });
  }

  function schedule() {
    if (pending.size && frame === null) frame = requestAnimationFrame(update);
  }

  document.addEventListener('focusin', event => settleWithin(event.target));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (link && link.origin === location.origin && link.pathname === location.pathname && link.hash) {
      settleWithin(document.getElementById(link.hash.slice(1)));
    }
  });
  function settleHash() {
    settleWithin(document.getElementById(location.hash.slice(1)));
  }
  settleHash();
  window.addEventListener('hashchange', settleHash);
  preference.addEventListener('change', () => {
    // Changing the accessibility preference also exposes unreached content.
    records.forEach(settle);
  });

  pending.forEach(record => {
    if (!preference.matches) {
      record.shift = record.rise;
      record.element.style.opacity = '0';
      record.element.style.transform = `translateY(${record.rise}px)`;
    }
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  update();
})();
