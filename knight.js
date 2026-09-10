

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


const marqueeTrack = document.getElementById('marquee');
if (marqueeTrack) {
  marqueeTrack.innerHTML += marqueeTrack.innerHTML;
}


const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slide-dots button');
const slideCounter = document.getElementById('slide-current');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let currentSlide = 0;
let autoplayTimer;

function goToSlide(i){
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = i;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  if (slideCounter) slideCounter.textContent = String(currentSlide + 1).padStart(2, '0');
}

function nextSlide(){
  goToSlide((currentSlide + 1) % slides.length);
}

function startAutoplay(){
  if (!reduceMotion && slides.length) {
    autoplayTimer = setInterval(nextSlide, 4000);
  }
}

function stopAutoplay(){
  clearInterval(autoplayTimer);
}

dots.forEach(dotButton => {
  dotButton.addEventListener('click', () => {
    goToSlide(parseInt(dotButton.dataset.goto, 10));
    stopAutoplay();
    startAutoplay();
  });
});

const heroSection = document.querySelector('.hero');
if (heroSection) {
  heroSection.addEventListener('mouseenter', stopAutoplay);
  heroSection.addEventListener('mouseleave', startAutoplay);
}

if (slides.length) {
  startAutoplay();
}

if (document.querySelector('.processSwiper')) {
  const processSwiper = new Swiper(".processSwiper", {
    loop: true,
    speed: 700,
    spaceBetween: 24,
    autoplay: {
      delay: 1500,
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 2.5 },
      1200: { slidesPerView: 3 }
    }
  });
}

if (document.querySelector('.serviceSwiper')) {
  const serviceSwiper = new Swiper(".serviceSwiper", {
    loop: true,
    speed: 1000,
    spaceBetween: 26,
    slidesPerView: 3,
    centeredSlides: false,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1100: {
        slidesPerView: 3,
        spaceBetween: 26,
      }
    }
  });
}