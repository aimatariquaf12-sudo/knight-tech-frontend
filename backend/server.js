require('dotenv').config(); // .env file se email credentials load karne ke liye

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

const POSTS_FILE = path.join(__dirname, 'posts.json');
const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

app.use(cors());
app.use(express.json());

// ---- Email transporter setup ----
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // aapki Gmail address
    pass: process.env.EMAIL_PASS, // Gmail App Password (normal password nahi)
  },
});

async function sendContactNotification(contact) {
  try {
    await transporter.sendMail({
      from: `"Knight Tech Solution Website" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // jahan aap notification receive karna chahti hain
      subject: `New Contact Form Submission — ${contact.firstName} ${contact.lastName || ''}`,
      html: `
        <h3>Naya message contact form se aaya hai</h3>
        <p><strong>Naam:</strong> ${contact.firstName} ${contact.lastName || ''}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Campaign Type:</strong> ${contact.service || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message || '(koi message nahi)'}</p>
      `,
    });
    console.log('Email notification bhej di gayi.');
  } catch (err) {
    console.error('Email bhejne mein masla hua:', err.message);
    // Yahan hum error throw nahi karte kyunke contact data already save ho chuka hai
  }
}

// ---- helpers (posts) ----
function readPosts() {
  if (!fs.existsSync(POSTS_FILE)) return [];
  const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function writePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

function nextId(posts) {
  return posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1;
}

// ---- helpers (contacts) ----
function readContacts() {
  if (!fs.existsSync(CONTACTS_FILE)) return [];
  const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeContacts(contacts) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
}

function nextContactId(contacts) {
  return contacts.length ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
}

// ==================== POSTS ROUTES ====================

app.get('/api/posts', (req, res) => {
  res.json(readPosts());
});

app.get('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const post = posts.find(p => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post nahi mili.' });
  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const posts = readPosts();
  const body = req.body || {};

  if (!body.title || !body.title.trim()) {
    return res.status(400).json({ error: 'Title zaroori hai.' });
  }

  const newPost = {
    id: nextId(posts),
    category: body.category || '',
    tag: body.tag || '',
    title: body.title,
    excerpt: body.excerpt || '',
    image: body.image || '',
    date: body.date || new Date().toISOString().split('T')[0],
    readTime: body.readTime || '',
    link: body.link || '#',
    isFeatured: !!body.isFeatured,
    isHidden: !!body.isHidden,
  };

  posts.push(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Post nahi mili.' });

  const body = req.body || {};
  posts[idx] = {
    ...posts[idx],
    category: body.category ?? posts[idx].category,
    tag: body.tag ?? posts[idx].tag,
    title: body.title ?? posts[idx].title,
    excerpt: body.excerpt ?? posts[idx].excerpt,
    image: body.image ?? posts[idx].image,
    date: body.date ?? posts[idx].date,
    readTime: body.readTime ?? posts[idx].readTime,
    link: body.link ?? posts[idx].link,
    isFeatured: body.isFeatured !== undefined ? !!body.isFeatured : posts[idx].isFeatured,
    isHidden: body.isHidden !== undefined ? !!body.isHidden : posts[idx].isHidden,
    id: posts[idx].id,
  };

  writePosts(posts);
  res.json(posts[idx]);
});

app.delete('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Post nahi mili.' });

  const [deleted] = posts.splice(idx, 1);
  writePosts(posts);
  res.json(deleted);
});

// ==================== CONTACT ROUTES ====================

// Contact form submit karein — ab email notification bhi bhejta hai
app.post('/api/contacts', async (req, res) => {
  const contacts = readContacts();
  const body = req.body || {};

  if (!body.firstName || !body.firstName.trim()) {
    return res.status(400).json({ error: 'First name zaroori hai.' });
  }
  if (!body.email || !body.email.trim()) {
    return res.status(400).json({ error: 'Email zaroori hai.' });
  }
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(body.email)) {
    return res.status(400).json({ error: 'Sahi email format daaliye.' });
  }

  const newContact = {
    id: nextContactId(contacts),
    firstName: body.firstName,
    lastName: body.lastName || '',
    email: body.email,
    service: body.service || 'Not sure yet',
    message: body.message || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  contacts.push(newContact);
  writeContacts(contacts);

  // Email bhejna — agar fail bhi ho, submission fail nahi honi chahiye
  sendContactNotification(newContact);

  res.status(201).json(newContact);
});

app.get('/api/contacts', (req, res) => {
  res.json(readContacts());
});

app.get('/api/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const contact = contacts.find(c => c.id === Number(req.params.id));
  if (!contact) return res.status(404).json({ error: 'Contact nahi mila.' });
  res.json(contact);
});

app.put('/api/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const idx = contacts.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Contact nahi mila.' });

  const body = req.body || {};
  contacts[idx] = {
    ...contacts[idx],
    status: body.status ?? contacts[idx].status,
    id: contacts[idx].id,
  };

  writeContacts(contacts);
  res.json(contacts[idx]);
});

app.delete('/api/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const idx = contacts.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Contact nahi mila.' });

  const [deleted] = contacts.splice(idx, 1);
  writeContacts(contacts);
  res.json(deleted);
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});