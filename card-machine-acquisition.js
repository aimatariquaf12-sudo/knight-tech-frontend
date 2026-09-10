document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => {
          el.style.transition = 'opacity .7s ease, transform .7s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, i * 60);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Stat counters ---------- */
  const statEls = document.querySelectorAll('.stat .n');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const plain = el.dataset.plain;
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (plain && progress === 1) {
          el.textContent = plain;
        } else {
          const value = Math.round(target * eased);
          el.textContent = value + (progress === 1 ? suffix : '');
        }
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = plain ? plain : target + suffix;
        }
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => statObserver.observe(el));

  /* ---------- Hero meter icon draw ---------- */
  const boltPaths = document.querySelectorAll('.bolt-path');
  const boltFill = document.getElementById('boltFill');
  window.setTimeout(() => {
    boltPaths.forEach(p => {
      p.style.transition = 'stroke-dashoffset 1s ease';
      p.style.strokeDashoffset = '0';
    });
    if (boltFill) {
      boltFill.style.transition = 'opacity .8s ease .6s';
      boltFill.style.opacity = '.14';
    }
  }, 300);

  /* ---------- Script line stagger reveal ---------- */
  const scriptLines = document.querySelectorAll('.script-line');
  const scriptObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      scriptLines.forEach((line, i) => {
        setTimeout(() => {
          line.style.transition = 'opacity .5s ease, transform .5s ease';
          line.style.opacity = '1';
          line.style.transform = 'translateX(0)';
        }, i * 220);
      });
      scriptObserver.disconnect();
    });
  }, { threshold: 0.3 });
  const scriptCard = document.querySelector('.script-card');
  if (scriptCard) scriptObserver.observe(scriptCard);

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

});