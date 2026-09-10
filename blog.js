// ===== CONFIG =====
const API_URL = 'https://knight-tech-backend-production.up.railway.app/api/posts';
const VISIBLE_COUNT = 6; // grid mein default kitne cards dikhein, baqi "Load More" pe

// ===== Hero particles (pehle jaisa hi, posts se koi lena dena nahi) =====
(function createHeroParticles() {
  const hero = document.querySelector('.page-hero');
  if (!hero) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const count = 14;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';

    const left = Math.random() * 100;
    const bottom = Math.random() * 40;
    const size = 3 + Math.random() * 4;
    const delay = Math.random() * 14;
    const duration = 10 + Math.random() * 10;

    p.style.left = `${left}%`;
    p.style.bottom = `${bottom}%`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.animationDelay = `${delay}s`;
    p.style.animationDuration = `${duration}s`;

    frag.appendChild(p);
  }

  hero.appendChild(frag);
})();

// ===== Scroll reveal observer (cards render hone ke baad har card pe lagta hai) =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// ===== Date format helper: "2026-08-12" -> "12 Aug 2026" =====
function formatDisplayDate(isoDate) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = new Date(isoDate);
  if (isNaN(d)) return isoDate;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ===== Card HTML builders (icon ki jagah ab <img> use ho raha hai) =====
function createBlogCardHTML(post, isExtra) {
  return `
    <article class="blog-card reveal${isExtra ? ' is-extra is-hidden' : ''}" data-category="${post.category}">
      <div class="blog-card-visual">
        <img src="${post.image}" alt="${post.title}">
      </div>
      <div class="blog-card-body">
        <span class="post-tag">${post.tag}</span>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <div class="post-meta">
          <span>${formatDisplayDate(post.date)}</span>
          <span class="dot"></span>
          <span>${post.readTime}</span>
        </div>
        <a href="${post.link}" class="post-link">
          Read more
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </article>
  `;
}

function createFeaturedHTML(post) {
  return `
    <div class="featured-card reveal">
      <div class="featured-visual">
        <img src="${post.image}" alt="${post.title}">
      </div>
      <div class="featured-copy">
        <span class="post-tag">${post.tag}</span>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <div class="post-meta">
          <span>${formatDisplayDate(post.date)}</span>
          <span class="dot"></span>
          <span>${post.readTime}</span>
        </div>
        <a href="${post.link}" class="post-link">
          Read full post
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </div>
  `;
}

// ===== Fetch posts.json (via backend) aur cards render karo =====
async function loadPosts() {
  let allPosts = [];

  try {
    const res = await fetch(API_URL);
    allPosts = await res.json();
  } catch (err) {
    console.error('Posts load nahi ho sake. Kya backend server chal raha hai?', err);
    return;
  }

  // isHidden: true wale posts kabhi bhi page par nahi aayenge
  const visiblePosts = allPosts.filter(p => !p.isHidden);

  // Featured post alag section mein, baqi normal grid mein
  const featured = visiblePosts.find(p => p.isFeatured);
 // Naya — date ke hisaab se newest post pehle
const gridPosts = visiblePosts
  .filter(p => !p.isFeatured)
  .sort((a, b) => new Date(b.date) - new Date(a.date));

  const featuredSection = document.getElementById('featured-post-section');
  const featuredContainer = document.getElementById('featured-post-container');
  if (featured && featuredSection && featuredContainer) {
    featuredContainer.innerHTML = createFeaturedHTML(featured);
    featuredSection.style.display = '';
  }

  const grid = document.getElementById('blog-grid');
  if (grid) {
    grid.innerHTML = gridPosts
      .map((post, i) => createBlogCardHTML(post, i >= VISIBLE_COUNT))
      .join('');
  }

  // Ab jab cards DOM mein aa chuki hain, filter/search/sort/load-more chalu karo
  initBlogInteractions();

  // Featured card ka reveal bhi observe karo
  document.querySelectorAll('.featured-card.reveal').forEach(el => revealObserver.observe(el));

  // services-row wale reveal (agar hain) — page load pe hi set
  document.querySelectorAll('.services-row .reveal').forEach((el, i) => {
    el.style.setProperty('--reveal-i', i);
    revealObserver.observe(el);
  });
}

// ===== Category filters + Search + Sort (ab yeh dynamic cards ke baad chalta hai) =====
function initBlogInteractions() {
  const grid = document.getElementById('blog-grid');
  const filterPills = document.querySelectorAll('.filter-pill:not(.filter-clear)');
  const clearBtn = document.getElementById('clear-filter');
  const searchInput = document.getElementById('blog-search-input');
  const sortSelect = document.getElementById('blog-sort');
  const blogCards = document.querySelectorAll('.blog-card');
  const blogEmpty = document.getElementById('blog-empty');
  const loadMoreRow = document.getElementById('load-more-row');
  const loadMoreBtn = document.getElementById('load-more');

  const FILTER_TRANSITION_MS = 260;

  let activeFilter = 'all';
  let searchTerm = '';
  let sortOrder = 'newest';
  let extrasRevealed = false;

  let filtering = false;

  // Cards ko reveal-i set karke observe karo
  blogCards.forEach((el, i) => {
    el.style.setProperty('--reveal-i', i % 6);
    revealObserver.observe(el);
  });

  function setPillCounts() {
    const counts = { all: blogCards.length };

    blogCards.forEach(card => {
      const cat = card.dataset.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });

    filterPills.forEach(pill => {
      const key = pill.dataset.filter;
      const countEl = pill.querySelector('.pill-count');
      if (countEl && counts[key] !== undefined) {
        countEl.textContent = `(${counts[key]})`;
      }
    });
  }

  function parseDate(text) {
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const parts = text.trim().split(/\s+/);
    if (parts.length !== 3) return new Date(NaN);

    const day = parseInt(parts[0], 10);
    const monthKey = parts[1].toLowerCase().slice(0, 3);
    const month = months[monthKey];
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || month === undefined || isNaN(year)) return new Date(NaN);

    return new Date(year, month, day);
  }

  function sortVisibleCards() {
    const visible = Array.from(blogCards).filter(c => !c.classList.contains('is-hidden'));

    visible.sort((a, b) => {
      const dateA = parseDate(a.querySelector('.post-meta span').textContent);
      const dateB = parseDate(b.querySelector('.post-meta span').textContent);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    visible.forEach(card => grid.appendChild(card));
  }

  function revealExtrasIfNeeded() {
    const hasHiddenExtras = Array.from(blogCards).some(
      c => c.classList.contains('is-extra') && c.classList.contains('is-hidden')
    );

    if (!hasHiddenExtras) return;

    extrasRevealed = true;
    document.querySelectorAll('.blog-card.is-extra').forEach((card, i) => {
      card.classList.remove('is-hidden');
      card.style.setProperty('--reveal-i', i);
      revealObserver.observe(card);
    });

    if (loadMoreRow) loadMoreRow.style.display = 'none';
  }

  function applyFilter() {
    if (filtering) return;
    filtering = true;

    const term = searchTerm.trim().toLowerCase();
    const toHide = [];
    const toShow = [];

    blogCards.forEach(card => {
      const category = card.dataset.category;
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const isExtra = card.classList.contains('is-extra');

      const matchesCategory = activeFilter === 'all' || category === activeFilter;
      const matchesSearch = term === '' || title.includes(term) || desc.includes(term);

      const isDefaultView = activeFilter === 'all' && term === '';
      const matchesExtra = !isExtra || extrasRevealed || !isDefaultView;

      const shouldShow = matchesCategory && matchesSearch && matchesExtra;
      const currentlyHidden = card.classList.contains('is-hidden');

      if (shouldShow && currentlyHidden) toShow.push(card);
      if (!shouldShow && !currentlyHidden) toHide.push(card);
    });

    toHide.forEach(card => card.classList.add('is-filter-out'));

    window.setTimeout(() => {
      toHide.forEach(card => {
        card.classList.add('is-hidden');
        card.classList.remove('is-filter-out');
      });

      toShow.forEach((card, i) => {
        card.classList.remove('is-hidden');
        card.style.setProperty('--reveal-i', i % 6);
        card.classList.remove('is-filter-in');
        void card.offsetWidth;
        card.classList.add('is-filter-in');
      });

      sortVisibleCards();

      const visibleCount = document.querySelectorAll('.blog-card:not(.is-hidden)').length;
      if (blogEmpty) blogEmpty.classList.toggle('show', visibleCount === 0);

      const isDefaultView = activeFilter === 'all' && searchTerm.trim() === '';
      if (loadMoreRow) loadMoreRow.style.display = (isDefaultView && !extrasRevealed) ? '' : 'none';

      filtering = false;
    }, toHide.length ? FILTER_TRANSITION_MS : 0);
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('active')) return;
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      pill.classList.remove('pill-pop');
      void pill.offsetWidth;
      pill.classList.add('pill-pop');

      activeFilter = pill.dataset.filter;
      if (clearBtn) clearBtn.style.display = (activeFilter === 'all') ? 'none' : 'inline-flex';

      applyFilter();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      activeFilter = 'all';
      filterPills.forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('.filter-pill[data-filter="all"]');
      if (allPill) allPill.classList.add('active');
      clearBtn.style.display = 'none';
      applyFilter();
    });
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchTerm = this.value;
        applyFilter();
      }, 150);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortOrder = this.value;
      revealExtrasIfNeeded();
      sortVisibleCards();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      extrasRevealed = true;
      document.querySelectorAll('.blog-card.is-extra').forEach((card, i) => {
        card.style.setProperty('--reveal-i', i);
        revealObserver.observe(card);
      });
      applyFilter();
    });
  }

  setPillCounts();
  applyFilter();
}

// ===== Newsletter form micro-interaction (posts se lena dena nahi) =====
const ctaForm = document.querySelector('.blog-cta-form');
if (ctaForm) {
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = ctaForm.querySelector('button');
    btn.textContent = 'Subscribed ✓';
    btn.classList.add('is-success');
    btn.disabled = true;
  });
}

// ===== Start =====
loadPosts();
