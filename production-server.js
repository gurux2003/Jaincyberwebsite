// ============================================================
// JAIN CYBER SOLUTIONS - Production Server (Hostinger)
// ============================================================
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'jcs-admin-secret-key-2024-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data files paths
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');

// Admin credentials (change these in production)
const adminCredentials = {
  'admin@jaincybersolutions.com': '$2a$10$rOzJqQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQjQ' // Admin@JCS2024!
};

// Helper functions
async function initDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  const defaultFiles = {
    [SETTINGS_FILE]: {
      siteName: "Jain Cyber Solutions",
      siteTagline: "Expert OT Cybersecurity & AI-Powered Services",
      siteDesc: "India's premier OT/ICS cybersecurity firm. Railway & Metro SCADA specialists. IEC 62443, ISO 27001, NIST CSF.",
      founded: "2004",
      hq: "Indore, Madhya Pradesh, India",
      phone: "+91-9509679668",
      email: "virendra.kothari@jaincybersolutions.com",
      address: "Indore, Madhya Pradesh, India",
      heroStats: {
        years: 20,
        projects: 50,
        standards: 9,
        satisfaction: 100
      }
    },
    [BLOGS_FILE]: [
      {
        _id: "1",
        title: "Why Railway OT Security Is India's #1 Cyber Priority for 2025",
        slug: "railway-ot-security-2025",
        excerpt: "Modern rail systems rely on SCADA networks increasingly targeted by nation-state actors and ransomware groups.",
        content: "Full content here...",
        category: "Railway",
        author: "Virendra Kothari",
        date: "2024-12-01",
        readTime: 8,
        status: "published",
        featured: true
      }
    ],
    [LEADS_FILE]: [],
    [CONTACTS_FILE]: [],
    [SERVICES_FILE]: [
      {
        _id: "1",
        title: "Security Control Assessment",
        icon: "🛡️",
        shortDesc: "Meticulous evaluation of your existing security controls",
        longDesc: "Comprehensive assessment guided by IEC 62443-4-2, NIST CSF, and ISO 27002",
        category: "Assessment",
        order: 1,
        active: true
      }
    ]
  };

  for (const [file, defaultData] of Object.entries(defaultFiles)) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, JSON.stringify(defaultData, null, 2));
    }
  }
}

async function readDataFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeDataFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = adminCredentials[email];
  
  if (!hashedPassword || !(await bcrypt.compare(password, hashedPassword))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { name: 'Virendra Kothari', email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    admin: { name: 'Virendra Kothari', email, role: 'admin' }
  });
});

// Public content routes
app.get('/api/content', async (req, res) => {
  const [settings, blogs, services] = await Promise.all([
    readDataFile(SETTINGS_FILE),
    readDataFile(BLOGS_FILE),
    readDataFile(SERVICES_FILE)
  ]);
  
  res.json({
    settings,
    blogs: blogs.filter(blog => blog.status === 'published'),
    services: services.filter(service => service.active)
  });
});

// Settings routes
app.get('/api/settings', async (req, res) => {
  const settings = await readDataFile(SETTINGS_FILE);
  res.json({ settings });
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const success = await writeDataFile(SETTINGS_FILE, req.body);
  if (success) {
    res.json({ message: 'Settings saved successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Contact form route
app.post('/api/contacts', async (req, res) => {
  const contacts = await readDataFile(CONTACTS_FILE);
  const newContact = {
    _id: Date.now().toString(),
    ...req.body,
    date: new Date().toISOString(),
    read: false
  };
  contacts.push(newContact);
  await writeDataFile(CONTACTS_FILE, contacts);
  res.json({ message: 'Contact form submitted successfully' });
});

// Lead form route
app.post('/api/leads', async (req, res) => {
  const leads = await readDataFile(LEADS_FILE);
  const newLead = {
    _id: Date.now().toString(),
    ...req.body,
    date: new Date().toISOString(),
    status: 'new'
  };
  leads.push(newLead);
  await writeDataFile(LEADS_FILE, leads);
  res.json({ message: 'Lead submitted successfully' });
});

// WebSocket setup for real-time updates
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  clients.add(ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        ws.subscribedChannels = ws.subscribedChannels || new Set();
        ws.subscribedChannels.add(data.channel);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(channel, type, payload) {
  const message = JSON.stringify({ channel, type, payload });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      if (!channel || (client.subscribedChannels && client.subscribedChannels.has(channel))) {
        client.send(message);
      }
    }
  });
}

// Enhanced writeDataFile with WebSocket broadcasting
const originalWriteDataFile = writeDataFile;
writeDataFile = async function(filePath, data) {
  const success = await originalWriteDataFile(filePath, data);
  
  if (success) {
    if (filePath.includes('settings.json')) {
      broadcast('settings-updates', 'settings-update', data);
    } else if (filePath.includes('blogs.json')) {
      broadcast('content-updates', 'blog-update', data);
    }
  }
  
  return success;
};

// Start server
initDataDir().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JCS Production Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
});
