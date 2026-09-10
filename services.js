// Services page — scroll-triggered reveal animations
// Handles: .reveal-fade (fade + rise), .reveal-scale (fade + scale),
// and .stagger-group (parent toggles .in, children cascade via CSS nth-child delay)

(function () {
  var targets = document.querySelectorAll('.reveal-fade, .reveal-scale, .stagger-group');
  if (!targets.length) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  });

  targets.forEach(function (el) { observer.observe(el); });
})();

/*=========================================
        GSAP INIT
=========================================*/

gsap.registerPlugin(ScrollTrigger);


/*=========================================
        ELEMENTS
=========================================*/

const cards = gsap.utils.toArray(".kv-card");
const current = document.querySelector(".kv-current");
const fill = document.querySelector(".kv-fill");


/*=========================================
        INITIAL STATE
=========================================*/

cards.forEach((card, index) => {

    gsap.set(card, {
        x: index === 0 ? 0 : window.innerWidth,
        scale: index === 0 ? 1 : .92,
        opacity: index === 0 ? 1 : 0,      // hidden cards fully invisible, not .45 -> no bleed-through
        zIndex: index === 0 ? cards.length : 0
    });

    const items = card.querySelectorAll(".kv-label,h2,p,li,.kv-buttons");
    const overlay = card.querySelector(".kv-image-overlay");
    const image = card.querySelector(".kv-image img");

    if (index === 0) {
        // FIRST CARD: already visible on load, so its text/image must be
        // visible immediately too — not waiting on a scroll trigger that
        // never fires for it (this was why card 1's text was missing).
        gsap.set(items, { y: 0, opacity: 1 });
        gsap.set(overlay, { x: "100%" });
        gsap.set(image, { scale: 1.08 });
    } else {
        gsap.set(items, { y: 70, opacity: 0 });
        gsap.set(overlay, { x: "0%" });
        gsap.set(image, { scale: 1.25 });
    }

});


/*=========================================
        MAIN TIMELINE
=========================================*/

// SCROLL DISTANCE PER CARD — this controls how much you have to scroll
// per card, and therefore how much empty "dead" space is left after the
// pinned card finishes animating. Lower it to shorten that gap, raise it
// to make the scroll feel slower/longer.
const SCROLL_PER_CARD = 900;   // was 1400

const tl = gsap.timeline({

    scrollTrigger: {

        trigger: ".kv-stack",
        start: "top top",
        end: "+=" + (cards.length * SCROLL_PER_CARD),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onUpdate: (self) => {

            const progress = self.progress;
            let index = Math.round(progress * (cards.length - 1));

            if (index < 0) index = 0;
            if (index > cards.length - 1) index = cards.length - 1;

            cards.forEach((card, i) => {

                card.classList.remove("active");
                if (i === index) card.classList.add("active");

                // Keep stacking order correct as the active card changes —
                // this used to be set once at the start and never updated,
                // which let older cards sit visually on top of the new one.
                gsap.set(card, {
                    zIndex: i <= index ? (cards.length - i) : 0
                });

            });

            current.textContent = String(index + 1).padStart(2, "0");

            gsap.to(fill, {
                height: ((index + 1) / cards.length) * 100 + "%",
                duration: .35,
                ease: "power2.out"
            });

        }

    }

});


/*=========================================
        CARD-BY-CARD TRANSITIONS
        (slide in, push previous card fully away, reveal its own text
        and image — all inside ONE scrubbed timeline so nothing drifts
        out of sync and nothing lingers behind the active card)
=========================================*/

cards.forEach((card, index) => {

    if (index === 0) return;

    const prevCard = cards[index - 1];
    const items = card.querySelectorAll(".kv-label,h2,p,li,.kv-buttons");
    const overlay = card.querySelector(".kv-image-overlay");
    const image = card.querySelector(".kv-image img");

    const label = "card" + index;
    tl.addLabel(label);

    // incoming card slides fully into place
    tl.to(card, {
        x: 0,
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power3.inOut"
    }, label);

    // outgoing card leaves the stage completely instead of just fading
    // in place on top of the new card (that overlap was causing the
    // double/ghost text you were seeing in the blue version)
    tl.to(prevCard, {
        x: -window.innerWidth * .3,
        scale: .85,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    }, label);

    // text stagger, timed to when the card actually arrives
    tl.fromTo(items,
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, stagger: .12, duration: .9, ease: "power3.out" },
        label + "+=0.15"
    );

    // image wipe reveal
    tl.fromTo(overlay,
        { x: "0%" },
        { x: "100%", duration: 1.2, ease: "power3.out" },
        label
    );

    // image zoom-settle + slight parallax pan combined
    tl.fromTo(image,
        { scale: 1.25, yPercent: 0 },
        { scale: 1, yPercent: 4, duration: 1.4, ease: "power3.out" },
        label
    );

});


/*=========================================
        BLUE GLOW
=========================================*/

gsap.to(".blue-glow", {
    scale: 1.25,
    opacity: .9,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});


/*=========================================
        REFRESH
=========================================*/

window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});
/*=========================================
REGISTER GSAP
=========================================*/

gsap.registerPlugin(ScrollTrigger);

/*=========================================
CARDS ANIMATION
=========================================*/

gsap.from(".stat-card",{

    y:120,

    opacity:0,

    duration:1,

    ease:"power4.out",

    stagger:.25,

    scrollTrigger:{

        trigger:".stats-grid",

        start:"top 80%",

        once:true

    }

});

/*=========================================
HEADING
=========================================*/

gsap.from(".stats-head > *",{

    y:40,

    opacity:0,

    stagger:.18,

    duration:1,

    ease:"power3.out",

    scrollTrigger:{

        trigger:".stats-head",

        start:"top 80%",

        once:true

    }

});

/*=========================================
FEATURE STRIP
=========================================*/

gsap.from(".feature",{

    y:60,

    opacity:0,

    duration:.8,

    stagger:.12,

    ease:"power3.out",

    scrollTrigger:{

        trigger:".feature-strip",

        start:"top 85%",

        once:true

    }

});

/*=========================================
COUNT UP
=========================================*/

const counters=document.querySelectorAll(".counter");

const counterObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(!entry.isIntersecting) return;

const counter=entry.target;

const target=+counter.dataset.target;

let value=0;

const speed=target/80;

const update=()=>{

value+=speed;

if(value<target){

counter.innerText=Math.floor(value);

requestAnimationFrame(update);

}else{

counter.innerText=target;

}

}

update();

counterObserver.unobserve(counter);

});

},{threshold:.5});

counters.forEach(counter=>{

counterObserver.observe(counter);

});

/*=========================================
PROGRESS BAR
=========================================*/

gsap.to(".progress span",{

width:"100%",

duration:1.5,

ease:"power2.out",

stagger:.2,

scrollTrigger:{

trigger:".stats-grid",

start:"top 75%",

once:true

}

});

/*=========================================
GLOW PULSE
=========================================*/

gsap.to(".blob1",{

scale:1.25,

duration:6,

repeat:-1,

yoyo:true,

ease:"sine.inOut"

});

gsap.to(".blob2",{

scale:1.18,

duration:7,

repeat:-1,

yoyo:true,

ease:"sine.inOut"

});

gsap.to(".blob3",{

scale:1.3,

duration:8,

repeat:-1,

yoyo:true,

ease:"sine.inOut"

});

/*=========================================
FLOATING ICONS
=========================================*/

gsap.to(".icon",{

y:-12,

duration:2,

repeat:-1,

yoyo:true,

stagger:.3,

ease:"sine.inOut"

});

/*=========================================
SECTION PARALLAX
=========================================*/

gsap.to(".kv-bg",{

yPercent:-12,

ease:"none",

scrollTrigger:{

trigger:".kv-stats",

scrub:true

}

});

/*=========================================
MAGNETIC BUTTON EFFECT (Future Ready)
=========================================*/

document.querySelectorAll(".stat-card").forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

const rotateX=(y-rect.height/2)/18;

const rotateY=(rect.width/2-x)/18;

card.style.transform=

`perspective(900px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-12px)`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform=

"perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";

});

});



/*=========================================
    PREMIUM WHY-SECTION REVEAL (svc-why)
=========================================*/
(function () {

  var whySection = document.getElementById("whySection");
  if (!whySection) return;

  var whyHead  = document.getElementById("whyHead");
  var whyCards = gsap.utils.toArray("#whyGrid .svc-why-card");
  if (!whyCards.length) return;

  var eyebrow = whyHead.querySelector(".eyebrow");
  var heading = whyHead.querySelector("h2");
  var para    = whyHead.querySelector("p");

  gsap.set([eyebrow, heading, para], { opacity: 0, y: 24 });
  gsap.set(whyCards, { opacity: 0, x: -60 });

  ScrollTrigger.create({
    trigger: whySection,
    start: "top 78%",
    once: true,
    onEnter: function () {
      var tl = gsap.timeline();

      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
        .to(heading, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.35")
        .to(para,    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.30")
        .to(whyCards, {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15   // Card1: 0s, Card2: .15s, Card3: .30s, Card4: .45s
        }, "-=0.15");
    }
  });

})();
