gsap.registerPlugin(ScrollTrigger);

/* ---- Hero entrance ---- */
gsap.from(".water-hero .eyebrow", {y:16, opacity:0, duration:.6, delay:.15});
gsap.from(".water-hero h1", {y:26, opacity:0, duration:.75, delay:.28, ease:"power3.out"});
gsap.from(".water-hero p.lead", {y:20, opacity:0, duration:.7, delay:.42});
gsap.from(".hero-ctas .btn", {y:16, opacity:0, duration:.6, delay:.55, stagger:.1});
gsap.from(".trust-row span", {opacity:0, duration:.6, delay:.75, stagger:.08});
gsap.from(".glass-card", {x:40, opacity:0, duration:.85, delay:.3, ease:"power3.out"});

/* ---- Glass fill rises + wave settles ---- */
const fillWave = document.getElementById('fillWave');
gsap.set(fillWave, {y: 170});
gsap.to(fillWave, {y: 0, duration: 1.6, delay: 1, ease: "power2.out"});

/* ---- Enrolment counter ---- */
let fillObj = {v:0};
gsap.to(fillObj, {
  v:87, duration:1.6, delay:1.1, ease:"power1.out",
  onUpdate:()=>{ document.querySelector("#fillNum").innerHTML = Math.round(fillObj.v)+'<span>% opt-in rate</span>'; }
});

/* ---- Section reveals ---- */
document.querySelectorAll(".reveal").forEach(el=>{
  gsap.to(el, {
    opacity:1, y:0, duration:.8, ease:"power3.out",
    scrollTrigger:{trigger:el, start:"top 85%"}
  });
});

/* ---- Stat counters + ripple underline ---- */
document.querySelectorAll(".stat .n").forEach(el=>{
  const target = el.dataset.target;
  const suffix = el.dataset.suffix || "";
  const plain = el.dataset.plain;
  const statCard = el.closest(".stat");
  ScrollTrigger.create({
    trigger: el, start:"top 88%", once:true,
    onEnter:()=>{
      statCard.classList.add("rippled");
      if(plain){ el.textContent = plain; return; }
      let obj = {v:0};
      gsap.to(obj, {v:target, duration:1.4, ease:"power1.out",
        onUpdate:()=>{ el.textContent = Math.round(obj.v) + suffix; }});
    }
  });
});

/* ---- Process timeline fill + active step ---- */
const procItems = gsap.utils.toArray(".proc-item");
ScrollTrigger.create({
  trigger:".process-list", start:"top 60%", end:"bottom 70%", scrub:.6,
  onUpdate:self=>{
    document.getElementById("procFill").style.height = (self.progress*100)+"%";
  }
});
procItems.forEach(item=>{
  ScrollTrigger.create({
    trigger:item, start:"top 65%", end:"bottom 65%",
    onEnter:()=>item.classList.add("on"),
    onEnterBack:()=>item.classList.add("on"),
    onLeaveBack:()=>item.classList.remove("on")
  });
});

/* ---- Script lines typewriter-reveal ---- */
ScrollTrigger.create({
  trigger:".script-card", start:"top 75%", once:true,
  onEnter:()=>{
    gsap.to(".script-line", {opacity:1, x:0, duration:.5, stagger:.35, ease:"power2.out"});
  }
});

/* ---- FAQ accordion ---- */
document.querySelectorAll(".faq-item").forEach(item=>{
  item.querySelector(".faq-q").addEventListener("click", ()=>{
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach(i=>i.classList.remove("open"));
    if(!wasOpen) item.classList.add("open");
  });
});

/* ---- Header shrink on scroll ---- */
ScrollTrigger.create({
  start:"top -60",
  onUpdate:self=>{
    document.querySelector("header").style.boxShadow = self.direction===1 ? "0 8px 24px rgba(0,0,0,.35)" : "none";
  }
});