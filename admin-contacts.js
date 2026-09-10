

const CONTACTS_API = 'https://knight-tech-backend-production.up.railway.app/api/contacts'; // poora URL, jaise posts.js mein hai

const contactsListEl = document.getElementById('contacts-list');

async function loadContacts() {
  try {
    const res = await fetch(CONTACTS_API);
    if (!res.ok) throw new Error(`Server ne status ${res.status} bheja`);
    const contacts = await res.json();
    renderContacts(contacts);
  } catch (err) {
    console.error('Contacts load nahi ho sakin. Kya backend chal raha hai?', err);
    contactsListEl.innerHTML = '<p>Contacts load nahi ho sakin. Backend server check karein (console dekhein).</p>';
  }
}

function renderContacts(contacts) {
  contactsListEl.innerHTML = '';

  if (!contacts.length) {
    contactsListEl.innerHTML = '<p>Abhi koi contact submission nahi hai.</p>';
    return;
  }

  // Sabse nayi submission sabse upar dikhayein
  const sorted = [...contacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  sorted.forEach(c => {
    const row = document.createElement('div');
    row.className = 'post-row';

    const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleString() : '';

    row.innerHTML = `
      <div class="info">
        <strong>${c.firstName} ${c.lastName || ''}</strong>
        <span>${c.email} • ${c.service || ''} • ${dateStr}</span>
        <span>${c.message ? c.message.substring(0, 120) : ''}${c.message && c.message.length > 120 ? '...' : ''}</span>
      </div>
      <div class="actions">
        <select class="status-select" data-id="${c.id}">
          <option value="new" ${c.status === 'new' ? 'selected' : ''}>New</option>
          <option value="read" ${c.status === 'read' ? 'selected' : ''}>Read</option>
          <option value="replied" ${c.status === 'replied' ? 'selected' : ''}>Replied</option>
        </select>
        <button data-id="${c.id}" class="view-btn secondary">View</button>
        <button data-id="${c.id}" class="danger delete-contact-btn">Delete</button>
      </div>
    `;

    contactsListEl.appendChild(row);
  });

  document.querySelectorAll('.status-select').forEach(sel =>
    sel.addEventListener('change', () => updateStatus(sel.dataset.id, sel.value))
  );

  document.querySelectorAll('.view-btn').forEach(btn =>
    btn.addEventListener('click', () => viewContact(btn.dataset.id, contacts))
  );

  document.querySelectorAll('.delete-contact-btn').forEach(btn =>
    btn.addEventListener('click', () => deleteContact(btn.dataset.id))
  );
}

async function updateStatus(id, status) {
  try {
    const res = await fetch(`${CONTACTS_API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Status update nahi ho saka');
  } catch (err) {
    console.error(err);
    alert('Status update karne mein masla hua.');
  }
}

function viewContact(id, contacts) {
  const contact = contacts.find(c => c.id === Number(id));
  if (!contact) return;

  alert(
    `Naam: ${contact.firstName} ${contact.lastName || ''}\n` +
    `Email: ${contact.email}\n` +
    `Service: ${contact.service || 'N/A'}\n\n` +
    `Message:\n${contact.message || '(koi message nahi)'}`
  );
}

async function deleteContact(id) {
  if (!confirm('Kya aap is contact submission ko delete karna chahti hain?')) return;
  await fetch(`${CONTACTS_API}/${id}`, { method: 'DELETE' });
  loadContacts();
}

loadContacts();