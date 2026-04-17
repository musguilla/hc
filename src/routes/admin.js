const express = require('express');
const { getPurchases } = require('../data');

const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/admin/login');
}

// Helper to get stats
async function getStats() {
  const purchases = await getPurchases(); // Filter is handled via SQL if needed, but here we just get all for stats
  const validPurchases = purchases.filter(p => p.status === 'paid');
  
  let totalXTR = 0;
  validPurchases.forEach(p => {
    totalXTR += p.amount;
  });
  
  const totalUSD = (totalXTR * 0.013).toFixed(2);
  
  return {
    totalRevenueXTR: totalXTR,
    totalRevenueUSD: parseFloat(totalUSD),
    totalSales: validPurchases.length,
    recentPurchases: validPurchases
  };
}

// Global styles for admin panel
const adminStyles = `
  <style>
    :root {
      --bg: #0d0d12;
      --surface: #1e1e24;
      --primary: #00F4CB;
      --text: #f0f0f0;
      --text-muted: #888;
      --border: #333;
    }
    body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }
    h1, h2, h3 { margin-top: 0; font-weight: 500; }
    .container { max-width: 1000px; margin: 0 auto; }
    .card { background: var(--surface); padding: 2rem; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: var(--surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); text-align: center; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: var(--primary); margin: 10px 0; }
    .stat-title { color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border); }
    th { color: var(--text-muted); font-weight: 500; font-size: 0.9rem; text-transform: uppercase; }
    tr:last-child td { border-bottom: none; }
    
    form { display: flex; flex-direction: column; gap: 1rem; max-width: 300px; margin: 0 auto; }
    input { padding: 1rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 1rem; }
    input:focus { outline: none; border-color: var(--primary); }
    button { padding: 1rem; border-radius: 8px; border: none; background: var(--primary); color: #000; font-size: 1rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
    button:hover { filter: brightness(1.1); }
    
    .nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .logout-btn { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1rem; width: auto; font-size: 0.9rem; }
    .logout-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .error { color: #ff5555; text-align: center; margin-bottom: 1rem; background: rgba(255,85,85,0.1); padding: 0.5rem; border-radius: 4px; }
  </style>
`;

// GET /admin/login
router.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.redirect('/admin');
  }
  
  const errorMsg = req.query.error ? '<div class="error">Invalid credentials</div>' : '';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin Login - Hashcoin Bot</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap" rel="stylesheet">
      ${adminStyles}
    </head>
    <body>
      <div class="container" style="display: flex; height: 80vh; align-items: center; justify-content: center;">
        <div class="card" style="width: 100%; max-width: 400px; padding: 3rem 2rem;">
          <h2 style="text-align: center; margin-bottom: 2rem; color: var(--primary);">#HASHCOIN <span style="font-weight: 300; color: #fff;">Admin</span></h2>
          ${errorMsg}
          <form method="POST" action="/admin/login">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </body>
    </html>
  `);
});

// POST /admin/login
const expressUrlencoded = express.urlencoded({ extended: true });
router.post('/login', expressUrlencoded, (req, res) => {
  const { username, password } = req.body;
  
  // HARDCODED credentials as requested
  if (username === 'admin' && password === 'Izzy#5537') {
    req.session.authenticated = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=1');
  }
});

// GET /admin/logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// GET /admin (Dashboard)
router.get('/', requireAuth, async (req, res) => {
  const stats = await getStats();
  
  let tableRows = '';
  if (stats.recentPurchases.length === 0) {
    tableRows = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No sales recorded yet.</td></tr>';
  } else {
    stats.recentPurchases.forEach(p => {
      const date = new Date(p.paidAt).toLocaleString();
      const user = p.username ? '@' + p.username : p.telegramId;
      tableRows += `
        <tr>
          <td>${date}</td>
          <td>${user}</td>
          <td>${p.productCode}</td>
          <td style="color: var(--primary); font-weight: 500;">+${p.amount} XTR</td>
        </tr>
      `;
    });
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin Dashboard - Hashcoin Bot</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap" rel="stylesheet">
      ${adminStyles}
    </head>
    <body>
      <div class="container">
        <div class="nav">
          <h2>#HASHCOIN <span style="font-weight: 300; color: var(--primary);">Dashboard</span></h2>
          <a href="/admin/logout"><button class="logout-btn">Logout</button></a>
        </div>
        
        <div class="grid">
          <div class="stat-card">
            <div class="stat-title">Total Revenue (XTR)</div>
            <div class="stat-value">⭐️ ${stats.totalRevenueXTR}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Estimated USD</div>
            <div class="stat-value">$${stats.totalRevenueUSD}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Total Sales</div>
            <div class="stat-value">🛍 ${stats.totalSales}</div>
          </div>
        </div>
        
        <div class="card">
          <h3>Recent Purchases</h3>
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Product</th>
                  <th>Amount (XTR)</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// GET /admin/api/stats
router.get('/api/stats', requireAuth, async (req, res) => {
  const stats = await getStats();
  // Return only the requested stats in JSON
  res.json({
    totalRevenueXTR: stats.totalRevenueXTR,
    totalRevenueUSD: stats.totalRevenueUSD,
    totalSales: stats.totalSales
  });
});

module.exports = router;
