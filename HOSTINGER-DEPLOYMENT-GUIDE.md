# JCS Website - Hostinger Deployment Guide

## 🚀 Quick Deployment Overview

Your Jain Cyber Solutions website is ready for Hostinger deployment. This guide covers all hosting plans and deployment methods.

## 📋 Pre-Deployment Checklist

### ✅ Files Ready:
- ✅ All HTML files (index.html, about.html, blog.html, etc.)
- ✅ CSS files (css/main.css)
- ✅ JavaScript files (js/main.js, js/content-loader.js)
- ✅ Admin panel files (admin/*.html, admin/*.js, admin/*.css)
- ✅ Assets (logo.png, images)
- ✅ Documentation files

### ⚠️ Note on Backend:
Your current setup includes a Node.js backend for admin functionality. For Hostinger deployment, you have options:
1. **Shared Hosting**: Static website only (admin features disabled)
2. **VPS Hosting**: Full Node.js backend + admin features
3. **Cloud Hosting**: Full Node.js backend + admin features

---

## 🌐 Option 1: Shared Hosting (Static Website Only)

### Best For: Basic website without admin panel

### Step 1: Prepare Files
```bash
# Create deployment folder
mkdir jcs-hostinger-deploy
cp -r css js admin *.html *.png jcs-hostinger-deploy/

# Remove admin backend files (not needed for static hosting)
rm jcs-hostinger-deploy/admin/admin.js
rm jcs-hostinger-deploy/admin/dashboard.html
rm jcs-hostinger-deploy/admin/settings.html
rm jcs-hostinger-deploy/admin/blogs.html
rm jcs-hostinger-deploy/admin/leads.html
rm jcs-hostinger-deploy/admin/contacts.html
rm jcs-hostinger-deploy/admin/services-admin.html
```

### Step 2: Upload to Hostinger
1. Login to Hostinger cPanel
2. Go to **File Manager**
3. Navigate to `public_html/`
4. Upload all files from `jcs-hostinger-deploy/`
5. Ensure folder structure is preserved

### Step 3: Configure
- Your website will be available at your domain
- Contact forms will need email configuration in cPanel
- Admin panel will not be available

---

## 🖥️ Option 2: VPS Hosting (Full Features)

### Best For: Complete admin panel + backend

### Step 1: VPS Setup
```bash
# Connect to your VPS via SSH
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install pm2 -g

# Create project directory
mkdir /var/www/jcs-website
cd /var/www/jcs-website
```

### Step 2: Upload Files
```bash
# Clone from GitHub or upload via SCP
git clone https://github.com/gurux2003/Jaincyberwebsite.git .

# Install dependencies
npm install

# Create data directory
mkdir data
chmod 755 data
```

### Step 3: Configure Environment
```bash
# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key-here
EOF

# Set permissions
chmod 600 .env
```

### Step 4: Start Application
```bash
# Start with PM2
pm2 start server.js --name "jcs-website"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 5: Configure Nginx
```bash
# Install Nginx
apt install nginx -y

# Create Nginx config
cat > /etc/nginx/sites-available/jcs-website << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Serve static files
    location / {
        root /var/www/jcs-website;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API requests
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/jcs-website /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## ☁️ Option 3: Cloud Hosting (Full Features)

### Best For: Scalable solution with admin panel

### Step 1: Hostinger Cloud Setup
1. Login to Hostinger Cloud Panel
2. Create new **Node.js** application
3. Select **Ubuntu 22.04** or similar
4. Choose plan based on your traffic needs

### Step 2: Deploy Application
```bash
# SSH into your cloud instance
ssh root@your-cloud-ip

# Follow same steps as VPS deployment
# (Steps 1-4 from VPS section above)
```

### Step 3: Domain Configuration
1. In Hostinger Cloud Panel, go to **Domains**
2. Add your domain
3. Point DNS to your cloud instance IP
4. Configure SSL certificate (free Let's Encrypt)

---

## 🔧 Configuration Files

### package.json (Ensure this is included)
```json
{
  "name": "jcs-admin-backend",
  "version": "1.0.0",
  "description": "Jain Cyber Solutions Admin Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### .htaccess (for Shared Hosting)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set expires headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/ico "access plus 1 month"
    ExpiresByType image/svg "access plus 1 month"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

## 📧 Email Configuration (Shared Hosting)

### Contact Form Setup
1. In Hostinger cPanel, go to **Email Accounts**
2. Create email: `info@your-domain.com`
3. Go to **Forwarders** → **Add Forwarder**
4. Forward `info@your-domain.com` to your personal email

### PHP Contact Form (Alternative)
Create `contact.php` for shared hosting:
```php
<?php
if ($_POST["submit"]) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    
    $to = "info@your-domain.com";
    $subject = "New Contact Form Submission";
    $headers = "From: $name <$email>";
    
    mail($to, $subject, $message, $headers);
    
    header("Location: index.html?status=success");
    exit();
}
?>
```

---

## 🔒 Security Considerations

### For VPS/Cloud Hosting:
1. **Update JWT Secret**: Change `JWT_SECRET` in .env
2. **Firewall**: Configure UFW firewall
3. **SSL**: Install Let's Encrypt certificate
4. **Backup**: Set up automated backups
5. **Monitoring**: Set up server monitoring

### For Shared Hosting:
1. **File Permissions**: Ensure proper file permissions
2. **Disable Directory Listing**: Prevent directory browsing
3. **Hotlink Protection**: Prevent image hotlinking

---

## 🚀 Post-Deployment Checklist

### ✅ Testing:
- [ ] Website loads correctly
- [ ] All pages work (about, services, contact, etc.)
- [ ] Contact form submits (if configured)
- [ ] Mobile responsive design works
- [ ] Globe animation displays correctly
- [ ] Admin panel works (VPS/Cloud only)

### ✅ Performance:
- [ ] Page load speed is good
- [ ] Images are optimized
- [ ] CSS/JS are minified
- [ ] Caching is configured

### ✅ SEO:
- [ ] Meta tags are correct
- [ ] Sitemap is accessible
- [ ] Google Analytics is installed
- [ ] SSL certificate is active

---

## 📞 Hostinger Support

If you need help:
1. **Live Chat**: Available 24/7 in Hostinger panel
2. **Knowledge Base**: https://support.hostinger.com
3. **Email**: support@hostinger.com

---

## 🎯 Recommended Next Steps

1. **Choose Hosting Plan**: Based on your needs and budget
2. **Register Domain**: If not already done
3. **Follow Deployment Steps**: Based on chosen plan
4. **Test Everything**: Ensure all features work
5. **Monitor Performance**: Keep an eye on website speed

---

## 🔄 Maintenance

### Regular Tasks:
- **Weekly**: Check for updates, backup files
- **Monthly**: Review performance, update content
- **Quarterly**: Security audit, SSL renewal

### For Admin Panel (VPS/Cloud):
- **Monitor Server**: Check server resources
- **Update Dependencies**: Keep Node.js packages updated
- **Backup Data**: Regular database backups

---

**Your website is now ready for Hostinger deployment!** 🚀

Choose the deployment option that best fits your needs and budget. For full admin functionality, VPS or Cloud hosting is recommended. For a simple website, Shared Hosting is sufficient.
