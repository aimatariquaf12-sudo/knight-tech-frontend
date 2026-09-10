async function loadPartial(placeholderId, filePath) {
  const el = document.getElementById(placeholderId);
  if (!el) {
    console.warn(`include.js: #${placeholderId} placeholder page mein nahi mila.`);
    return;
  }
  try {
    // cache: 'no-store' + timestamp query param — purani cached copy
    // kabhi use na ho, hamesha file ka latest/naya version fetch ho.
    const bustedUrl = filePath + (filePath.includes('?') ? '&' : '?') + 't=' + Date.now();
    const res = await fetch(bustedUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${filePath} load nahi hui (status ${res.status})`);
    const html = await res.text();
    el.outerHTML = html;
  } catch (err) {
    console.error('include.js error:', err);
  }
}

function setActiveNav(currentPage) {
  document.querySelectorAll('.nav-links > a, .mobile-menu > a').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('act', href === currentPage);
  });
}

function getCurrentPage() {
  // URL ka aakhri hissa nikalta hai, jaise "blog.html".
  // Agar page root par hai (jaise "/" ya khaali), to "knight.html" treat karta hai.
  const path = window.location.pathname.split('/').pop();
  return path && path.length ? path : 'knight.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Path "partials/" folder ke hisab se hai — agar page kisi
  // subfolder mein hai to relative path adjust karein (jaise "../partials/...")
  await loadPartial('header-placeholder', 'partials/header.part');
  await loadPartial('footer-placeholder', 'partials/footer.part');

  // Header/footer ab DOM mein maujood hain. Baqi scripts (jaise knight.js)
  // ko batane ke liye ke ab menu-toggle, site-header, mobile-menu waghera
  // safely mil jayenge, ye custom event fire karte hain.
  document.dispatchEvent(new Event('partialsLoaded'));

  // Har page par current URL ke hisab se sahi nav link par
  // automatically ".act" class lag jati hai — ab manually har
  // page ke header mein class="act" badalne ki zaroorat nahi.
  setActiveNav(getCurrentPage());
});