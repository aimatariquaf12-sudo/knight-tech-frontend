const API = 'https://knight-tech-backend-production.up.railway.app/api/posts'; // poora URL, taake admin.html kahin bhi se khule tab bhi backend tak pahunche

const form = document.getElementById('post-form');
const listEl = document.getElementById('posts-list');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

const fields = ['title', 'category', 'tag', 'contentPath', 'excerpt', 'image', 'date', 'readTime', 'link'];

// ----- Tag word limit -----
const TAG_WORD_LIMIT = 3;
const tagInput = document.getElementById('tag');
const tagCounter = document.getElementById('tag-counter');

// ----- Title character limit -----
const TITLE_CHAR_LIMIT = 60;
const titleInput = document.getElementById('title');
const titleCounter = document.getElementById('title-counter');
const titleError = document.getElementById('title-error');

// ----- Description (excerpt) character limit -----
const DESC_CHAR_LIMIT = 160;
const excerptInput = document.getElementById('excerpt');
const excerptCounter = document.getElementById('excerpt-counter');
const excerptError = document.getElementById('excerpt-error');

const imageInput = document.getElementById('image');
const imageFileInput = document.getElementById('image-file');

function countWords(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function enforceTagLimit() {
  const words = tagInput.value.trim().split(/\s+/).filter(Boolean);
  if (words.length > TAG_WORD_LIMIT) {
    tagInput.value = words.slice(0, TAG_WORD_LIMIT).join(' ');
  }
  const count = countWords(tagInput.value);
  tagCounter.textContent = `${count} / ${TAG_WORD_LIMIT} words`;
  tagCounter.classList.toggle('limit-reached', count >= TAG_WORD_LIMIT);
}

function enforceTitleLimit() {
  const len = titleInput.value.length;
  const atLimit = len >= TITLE_CHAR_LIMIT;
  titleCounter.textContent = `${len} / ${TITLE_CHAR_LIMIT} characters`;
  titleCounter.classList.toggle('limit-reached', atLimit);
  titleInput.classList.toggle('input-error', atLimit);
  if (titleError) titleError.classList.toggle('show', atLimit);
}

function enforceDescLimit() {
  const len = excerptInput.value.length;
  const atLimit = len >= DESC_CHAR_LIMIT;
  excerptCounter.textContent = `${len} / ${DESC_CHAR_LIMIT} characters`;
  excerptCounter.classList.toggle('limit-reached', atLimit);
  excerptInput.classList.toggle('input-error', atLimit);
  if (excerptError) excerptError.classList.toggle('show', atLimit);
}

tagInput.addEventListener('input', enforceTagLimit);
titleInput.addEventListener('input', enforceTitleLimit);
excerptInput.addEventListener('input', enforceDescLimit);

// ----- File explorer se image select karke path field bharna -----
imageFileInput.addEventListener('change', () => {
  const file = imageFileInput.files[0];
  if (!file) return;
  imageInput.value = `/images/${file.name}`;
});

async function loadPosts() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Server ne status ${res.status} bheja`);
    const posts = await res.json();
    renderList(posts);
  } catch (err) {
    console.error('Posts load nahi ho sakin. Kya backend chal raha hai?', err);
    listEl.innerHTML = '<p>Posts load nahi ho sakin. Backend server check karein (console dekhein).</p>';
  }
}

function renderList(posts) {
  listEl.innerHTML = '';
  if (!posts.length) {
    listEl.innerHTML = '<p>Abhi koi post nahi hai.</p>';
    return;
  }
  posts.forEach(p => {
    const row = document.createElement('div');
    row.className = 'post-row';
    row.innerHTML = `
      <div class="info">
        <strong>${p.title}</strong>
        <span>${p.tag || p.category || ''} • ${p.date || ''} ${p.isHidden ? '• (Hidden)' : ''} ${p.isFeatured ? '• (Featured)' : ''}</span>
      </div>
      <div class="actions">
        <button data-id="${p.id}" class="edit-btn">Edit</button>
        <button data-id="${p.id}" class="danger delete-btn">Delete</button>
      </div>
    `;
    listEl.appendChild(row);
  });

  document.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => startEdit(btn.dataset.id))
  );
  document.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', () => deletePost(btn.dataset.id))
  );
}

async function startEdit(id) {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) return alert('Post nahi mili.');
  const post = await res.json();

  document.getElementById('post-id').value = post.id;
  fields.forEach(f => document.getElementById(f).value = post[f] || '');
  document.getElementById('isFeatured').checked = !!post.isFeatured;
  document.getElementById('isHidden').checked = !!post.isHidden;
  enforceTagLimit();
  enforceTitleLimit();
  enforceDescLimit();

  formTitle.textContent = 'Post Edit Karein';
  submitBtn.textContent = 'Update';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletePost(id) {
  if (!confirm('Kya aap is post ko delete karna chahti hain?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadPosts();
}

function resetForm() {
  form.reset();
  document.getElementById('post-id').value = '';
  formTitle.textContent = 'New Post';
  submitBtn.textContent = 'Publish';
  cancelBtn.style.display = 'none';
  enforceTagLimit();
  enforceTitleLimit();
  enforceDescLimit();
}

cancelBtn.addEventListener('click', resetForm);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('post-id').value;
  const payload = {};
  fields.forEach(f => payload[f] = document.getElementById(f).value);
  payload.isFeatured = document.getElementById('isFeatured').checked;
  payload.isHidden = document.getElementById('isHidden').checked;

  const url = id ? `${API}/${id}` : API;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Kuch ghalat ho gaya.');
    return;
  }

  resetForm();
  loadPosts();
});

loadPosts();