gsap.registerPlugin(ScrollTrigger);

/* ---- Hero entrance ---- */
gsap.from(".elec-hero .eyebrow", {y:16, opacity:0, duration:.6, delay:.15});
gsap.from(".elec-hero h1", {y:26, opacity:0, duration:.75, delay:.28, ease:"power3.out"});
gsap.from(".elec-hero p.lead", {y:20, opacity:0, duration:.7, delay:.42});
gsap.from(".hero-ctas .btn", {y:16, opacity:0, duration:.6, delay:.55, stagger:.1});
gsap.from(".trust-row span", {opacity:0, duration:.6, delay:.75, stagger:.08});
gsap.from(".meter-card", {x:40, opacity:0, duration:.85, delay:.3, ease:"power3.out"});

/* ---- Bolt draw + fill ---- */
const boltPath = document.getElementById('boltPath');
const boltFill = document.getElementById('boltFill');
const boltLen = boltPath.getTotalLength();
boltPath.style.strokeDasharray = boltLen;
boltPath.style.strokeDashoffset = boltLen;
gsap.to(boltPath, {strokeDashoffset:0, duration:1.1, delay:.9, ease:"power2.inOut",
  onComplete:()=>gsap.to(boltFill,{opacity:1, duration:.5})});
gsap.to(".bolt-wrap svg", {filter:"drop-shadow(0 0 14px rgba(92,141,255,.65))", duration:1, delay:1.9, repeat:-1, yoyo:true, ease:"sine.inOut"});

/* ---- Savings counter ---- */
let savingsObj = {v:0};
gsap.to(savingsObj, {
  v:184, duration:1.6, delay:1.1, ease:"power1.out",
  onUpdate:()=>{ document.querySelector("#savingsNum").innerHTML = "£"+Math.round(savingsObj.v)+'<span>/yr saved</span>'; }
});

/* ---- Section reveals ---- */
document.querySelectorAll(".reveal").forEach(el=>{
  gsap.to(el, {
    opacity:1, y:0, duration:.8, ease:"power3.out",
    scrollTrigger:{trigger:el, start:"top 85%"}
  });
});

/* ---- Stat counters ---- */
document.querySelectorAll(".stat .n").forEach(el=>{
  const target = el.dataset.target;
  const suffix = el.dataset.suffix || "";
  const plain = el.dataset.plain;
  ScrollTrigger.create({
    trigger: el, start:"top 88%", once:true,
    onEnter:()=>{
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