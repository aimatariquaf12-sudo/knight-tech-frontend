// ============ Landline & Broadband — page interactions ============

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- GSAP + ScrollTrigger scroll reveals ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    /* Script showcase lines type-in one after another */
    const scriptLines = document.querySelectorAll('.script-line');
    if (scriptLines.length) {
      gsap.to(scriptLines, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.35,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.script-card',
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });
    }
  } else {
    // Fallback: just show everything if GSAP failed to load
    document.querySelectorAll('.reveal, .script-line').forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }

  /* ---------- Stat counters ---------- */
  const counters = document.querySelectorAll('.stat .n');

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const plain = el.dataset.plain;

    if (plain) {
      el.textContent = plain;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Hero signal icon draw-on animation ---------- */
  const boltPath = document.getElementById('boltPath');
  const boltFill = document.getElementById('boltFill');
  const savingsNum = document.getElementById('savingsNum');

  if (boltPath && window.gsap) {
    const tl = gsap.timeline({ delay: 0.4 });
    tl.to(boltPath, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: 'power2.inOut'
    });
    if (boltFill) {
      tl.to(boltFill, {
        opacity: 1,
        duration: 0.6,
        ease: 'power1.out'
      }, '-=0.4');
    }
  } else if (boltPath) {
    boltPath.style.strokeDashoffset = 0;
    if (boltFill) boltFill.style.opacity = 1;
  }

  if (savingsNum) {
    // number is static text in markup ("100% recorded") — nothing to animate,
    // left here in case a numeric counter is swapped in later.
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

});