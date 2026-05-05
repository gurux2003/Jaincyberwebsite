const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const db = require('./db/database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));

// WebSocket connections for real-time updates
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Broadcast updates to all connected clients
function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ============ BLOG ROUTES ============
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await db.getBlogsPublished();
    res.json(blogs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await db.getBlog(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/blogs', async (req, res) => {
  try {
    const blog = await db.createBlog(req.body);
    broadcastUpdate('blog-created', blog);
    res.json(blog);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await db.updateBlog(req.params.id, req.body);
    broadcastUpdate('blog-updated', blog);
    res.json(blog);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await db.deleteBlog(req.params.id);
    broadcastUpdate('blog-deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ SERVICES ROUTES ============
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.getServices();
    res.json(services);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const service = await db.createService(req.body);
    broadcastUpdate('service-created', service);
    res.json(service);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const service = await db.updateService(req.params.id, req.body);
    broadcastUpdate('service-updated', service);
    res.json(service);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    await db.deleteService(req.params.id);
    broadcastUpdate('service-deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ PARTNERS ROUTES ============
app.get('/api/partners', async (req, res) => {
  try {
    const partners = await db.getPartners();
    res.json(partners);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const partner = await db.createPartner(req.body);
    broadcastUpdate('partner-created', partner);
    res.json(partner);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/partners/:id', async (req, res) => {
  try {
    const partner = await db.updatePartner(req.params.id, req.body);
    broadcastUpdate('partner-updated', partner);
    res.json(partner);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/partners/:id', async (req, res) => {
  try {
    await db.deletePartner(req.params.id);
    broadcastUpdate('partner-deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ SETTINGS ROUTES ============
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = await db.updateSettings(req.body);
    broadcastUpdate('settings-updated', settings);
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ ADMIN ROUTES ============
app.get('/api/admin/blogs', async (req, res) => {
  try {
    const blogs = await db.getAllBlogs();
    res.json(blogs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/leads', async (req, res) => {
  try {
    const leads = await db.getLeads();
    res.json(leads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/leads', async (req, res) => {
  try {
    const lead = await db.createLead(req.body);
    broadcastUpdate('lead-created', lead);
    res.json(lead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/contacts', async (req, res) => {
  try {
    const contacts = await db.getContacts();
    res.json(contacts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/contacts', async (req, res) => {
  try {
    const contact = await db.createContact(req.body);
    broadcastUpdate('contact-created', contact);
    res.json(contact);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ AUTH ROUTES ============
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@jaincybersolutions.com' && password === 'Admin@JCS2024!') {
    res.json({
      token: 'demo_token_' + Date.now(),
      admin: { name: 'Virendra Kothari', email, role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log(`✓ WebSocket server ready on ws://localhost:${PORT}`);
  console.log(`✓ Admin credentials: admin@jaincybersolutions.com / Admin@JCS2024!`);
});
