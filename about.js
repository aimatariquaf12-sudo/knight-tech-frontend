const cards = document.querySelectorAll(".timeline-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: .3 });

cards.forEach(card => observer.observe(card));

/* ===================== Count-up numbers ===================== */

const countEls = document.querySelectorAll('.ab-count');
const reduceMotionAbout = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el) {
  const targetAttr = el.dataset.target || '';
  const target = parseInt(targetAttr.replace(/[^\d]/g, ''), 10);

  // Non-numeric or already-formatted targets (e.g. "2019") just fade in as-is
  if (isNaN(target)) return;

  if (reduceMotionAbout) {
    el.textContent = targetAttr;
    return;
  }

  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = targetAttr;
    }
  }

  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

countEls.forEach((el) => countObserver.observe(el));
/* ===================== Orbit rings rotation (pure JS) ===================== */
(function () {
  const ringOne = document.querySelector(".orbit-one");
  const ringTwo = document.querySelector(".orbit-two");

  if (!ringOne || !ringTwo) return;

  const reduceMotionOrbit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionOrbit) return;

  let angleOne = 0;
  let angleTwo = 0;

  function animateOrbits() {
    angleOne += 0.05;   // speed of inner ring (clockwise)
    angleTwo -= 0.03;   // speed of outer ring (counter-clockwise)

    if (angleOne >= 360) angleOne = 0;
    if (angleTwo <= -360) angleTwo = 0;

    ringOne.style.transform = `translate(-50%, -50%) rotate(${angleOne}deg)`;
    ringTwo.style.transform = `translate(-50%, -50%) rotate(${angleTwo}deg)`;

    requestAnimationFrame(animateOrbits);
  }

  requestAnimationFrame(animateOrbits);
})();
document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('[data-reveal]');

  requestAnimationFrame(() => {
    setTimeout(() => {
      revealEls.forEach(el => el.classList.add('in-view'));
    }, 50);
  });

  const counters = document.querySelectorAll('[data-count]');

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  const card = document.querySelector('.card');
  if (card && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach(animateCount);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(card);
  } else {
    counters.forEach(animateCount);
  }
});
/*=========================================
    PREMIUM PRINCIPLES REVEAL (ab-principles)
    Card 1: left → in | Card 2: right → in | Card 3: left → in
=========================================*/
(function () {
  var section = document.getElementById("principlesSection");

  if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  var head = document.getElementById("principlesHead");
  var cards = gsap.utils.toArray(
    "#principlesGrid .ab-principle-card"
  );

  if (!cards.length) return;

  var eyebrow = head.querySelector(".eyebrow");
  var heading = head.querySelector("h2");
  var para = head.querySelector("p");

  /* Heading hidden initially */
  gsap.set([eyebrow, heading, para], {
    opacity: 0,
    y: 24
  });

  /* Cards:
     1 = Left
     2 = Right
     3 = Left
     4 = Right
  */
  cards.forEach(function (card, i) {
    gsap.set(card, {
      opacity: 0,
      x: i % 2 === 0 ? -100 : 100
    });
  });

  /* Heading animation */
  ScrollTrigger.create({
    trigger: head,
    start: "top 82%",
    once: true,

    onEnter: function () {
      gsap.timeline()
        .to(eyebrow, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        })
        .to(heading, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.35")
        .to(para, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.3");
    }
  });

  /* Each card animation */
  cards.forEach(function (card) {
    ScrollTrigger.create({
      trigger: card,
      start: "top 85%",
      once: true,

      onEnter: function () {
        gsap.to(card, {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out"
        });
      }
    });
  });

})();