const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'jcs.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Helper to run SQL queries
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Initialize database schema
async function initializeSchema() {
  const schemas = [
    `CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      category TEXT,
      author TEXT DEFAULT 'Jain Cyber Team',
      status TEXT DEFAULT 'draft',
      featured INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      readTime INTEGER DEFAULT 5,
      tags TEXT,
      publishedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      features TEXT,
      order_index INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      description TEXT,
      website TEXT,
      category TEXT,
      order_index INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const schema of schemas) {
    await run(schema);
  }
}

initializeSchema().catch(console.error);

// ============ BLOG FUNCTIONS ============
async function getBlogsPublished() {
  const blogs = await all('SELECT * FROM blogs WHERE status = ? ORDER BY publishedAt DESC', ['published']);
  return blogs.map(normalizeData);
}

async function getAllBlogs() {
  const blogs = await all('SELECT * FROM blogs ORDER BY publishedAt DESC, createdAt DESC');
  return blogs.map(normalizeData);
}

async function getBlog(id) {
  const blog = await get('SELECT * FROM blogs WHERE id = ?', [id]);
  return blog ? normalizeData(blog) : null;
}

async function createBlog(data) {
  const id = 'blog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  await run(`
    INSERT INTO blogs (id, title, excerpt, content, category, author, status, featured, readTime, tags, publishedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    data.title || '',
    data.excerpt || '',
    data.content || '',
    data.category || 'News',
    data.author || 'Jain Cyber Team',
    data.status || 'draft',
    data.featured ? 1 : 0,
    data.readTime || 5,
    data.tags ? JSON.stringify(data.tags) : '[]',
    data.publishedAt || new Date().toISOString()
  ]);
  return getBlog(id);
}

async function updateBlog(id, data) {
  const blog = await getBlog(id);
  if (!blog) throw new Error('Blog not found');
  
  await run(`
    UPDATE blogs SET
      title = ?,
      excerpt = ?,
      content = ?,
      category = ?,
      author = ?,
      status = ?,
      featured = ?,
      readTime = ?,
      tags = ?,
      publishedAt = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    data.title !== undefined ? data.title : blog.title,
    data.excerpt !== undefined ? data.excerpt : blog.excerpt,
    data.content !== undefined ? data.content : blog.content,
    data.category !== undefined ? data.category : blog.category,
    data.author !== undefined ? data.author : blog.author,
    data.status !== undefined ? data.status : blog.status,
    data.featured !== undefined ? (data.featured ? 1 : 0) : blog.featured,
    data.readTime !== undefined ? data.readTime : blog.readTime,
    data.tags !== undefined ? JSON.stringify(data.tags) : blog.tags,
    data.publishedAt !== undefined ? data.publishedAt : blog.publishedAt,
    id
  ]);
  return getBlog(id);
}

async function deleteBlog(id) {
  await run('DELETE FROM blogs WHERE id = ?', [id]);
}

// ============ SERVICES FUNCTIONS ============
async function getServices() {
  const services = await all('SELECT * FROM services ORDER BY order_index ASC, createdAt ASC');
  return services.map(normalizeData);
}

async function createService(data) {
  const id = 'service_' + Date.now();
  await run(`
    INSERT INTO services (id, title, description, icon, features, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    id,
    data.title || '',
    data.description || '',
    data.icon || '⚙️',
    data.features ? JSON.stringify(data.features) : '[]',
    data.order_index || 0
  ]);
  const service = await get('SELECT * FROM services WHERE id = ?', [id]);
  return normalizeData(service);
}

async function updateService(id, data) {
  const service = await get('SELECT * FROM services WHERE id = ?', [id]);
  if (!service) throw new Error('Service not found');
  
  await run(`
    UPDATE services SET
      title = ?,
      description = ?,
      icon = ?,
      features = ?,
      order_index = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    data.title !== undefined ? data.title : service.title,
    data.description !== undefined ? data.description : service.description,
    data.icon !== undefined ? data.icon : service.icon,
    data.features !== undefined ? JSON.stringify(data.features) : service.features,
    data.order_index !== undefined ? data.order_index : service.order_index,
    id
  ]);
  const updated = await get('SELECT * FROM services WHERE id = ?', [id]);
  return normalizeData(updated);
}

async function deleteService(id) {
  await run('DELETE FROM services WHERE id = ?', [id]);
}

// ============ PARTNERS FUNCTIONS ============
async function getPartners() {
  const partners = await all('SELECT * FROM partners ORDER BY order_index ASC, createdAt ASC');
  return partners.map(normalizeData);
}

async function createPartner(data) {
  const id = 'partner_' + Date.now();
  await run(`
    INSERT INTO partners (id, name, logo, description, website, category, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    data.name || '',
    data.logo || '',
    data.description || '',
    data.website || '',
    data.category || '',
    data.order_index || 0
  ]);
  const partner = await get('SELECT * FROM partners WHERE id = ?', [id]);
  return normalizeData(partner);
}

async function updatePartner(id, data) {
  const partner = await get('SELECT * FROM partners WHERE id = ?', [id]);
  if (!partner) throw new Error('Partner not found');
  
  await run(`
    UPDATE partners SET
      name = ?,
      logo = ?,
      description = ?,
      website = ?,
      category = ?,
      order_index = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    data.name !== undefined ? data.name : partner.name,
    data.logo !== undefined ? data.logo : partner.logo,
    data.description !== undefined ? data.description : partner.description,
    data.website !== undefined ? data.website : partner.website,
    data.category !== undefined ? data.category : partner.category,
    data.order_index !== undefined ? data.order_index : partner.order_index,
    id
  ]);
  const updated = await get('SELECT * FROM partners WHERE id = ?', [id]);
  return normalizeData(updated);
}

async function deletePartner(id) {
  await run('DELETE FROM partners WHERE id = ?', [id]);
}

// ============ SETTINGS FUNCTIONS ============
async function getSettings() {
  const rows = await all('SELECT key, value FROM settings');
  const result = {};
  rows.forEach(row => {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  });
  return result;
}

async function updateSettings(data) {
  for (const key of Object.keys(data)) {
    const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
    await run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
  return getSettings();
}

// ============ LEADS FUNCTIONS ============
async function getLeads() {
  const leads = await all('SELECT * FROM leads ORDER BY createdAt DESC');
  return leads.map(normalizeData);
}

async function createLead(data) {
  const id = 'lead_' + Date.now();
  await run(`
    INSERT INTO leads (id, name, email, phone, company, message, status)
    VALUES (?, ?, ?, ?, ?, ?, 'new')
  `, [id, data.name, data.email, data.phone || '', data.company || '', data.message || '']);
  const lead = await get('SELECT * FROM leads WHERE id = ?', [id]);
  return normalizeData(lead);
}

// ============ CONTACTS FUNCTIONS ============
async function getContacts() {
  const contacts = await all('SELECT * FROM contacts ORDER BY createdAt DESC');
  return contacts.map(normalizeData);
}

async function createContact(data) {
  const id = 'contact_' + Date.now();
  await run(`
    INSERT INTO contacts (id, name, email, phone, subject, message, status)
    VALUES (?, ?, ?, ?, ?, ?, 'new')
  `, [id, data.name, data.email, data.phone || '', data.subject || '', data.message || '']);
  const contact = await get('SELECT * FROM contacts WHERE id = ?', [id]);
  return normalizeData(contact);
}

// Helper function to normalize JSON fields
function normalizeData(row) {
  if (!row) return null;
  const normalized = { ...row };
  if (normalized.tags && typeof normalized.tags === 'string') {
    try {
      normalized.tags = JSON.parse(normalized.tags);
    } catch {
      normalized.tags = [];
    }
  }
  if (normalized.features && typeof normalized.features === 'string') {
    try {
      normalized.features = JSON.parse(normalized.features);
    } catch {
      normalized.features = [];
    }
  }
  return normalized;
}

module.exports = {
  // Blogs
  getBlogsPublished,
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  // Services
  getServices,
  createService,
  updateService,
  deleteService,
  // Partners
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  // Settings
  getSettings,
  updateSettings,
  // Leads
  getLeads,
  createLead,
  // Contacts
  getContacts,
  createContact,
  // Admin
  getAllBlogs
};
