const express = require('express');
const { getPurchases } = require('../data');
const { getEstimatedUSD } = require('../utils/conversion');

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
  
  const totalUSD = getEstimatedUSD(totalXTR);
  
  return {
    totalRevenueXTR: totalXTR,
    totalRevenueUSD: totalUSD,
    totalSales: validPurchases.length,
    recentPurchases: validPurchases
  };
}

// Global styles for admin panel
const adminStyles = `
  <style>
    :root {
      --bg: #09090b;
      --surface: #121217;
      --surface-hover: #1c1c24;
      --primary: #00F4CB;
      --primary-dim: rgba(0, 244, 203, 0.15);
      --text: #ffffff;
      --text-muted: #a1a1a9;
      --border: #27272a;
      --alert: #ef4444;
      --alert-dim: rgba(239, 68, 68, 0.15);
      --success: #10b981;
    }
    body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }
    h1, h2, h3 { margin-top: 0; font-weight: 600; letter-spacing: -0.5px; }
    .container { max-width: 1200px; margin: 0 auto; }
    
    .nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
    .brand { font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; }
    .logout-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; }
    .logout-btn:hover { background: var(--surface-hover); border-color: var(--text-muted); }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: var(--surface); padding: 2rem; border-radius: 16px; border: 1px solid var(--border); position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, var(--primary), transparent); opacity: 0.5; }
    .stat-title { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 1rem; font-weight: 500; }
    .stat-value { font-size: 3rem; font-weight: 700; color: var(--text); margin: 0; display: flex; align-items: center; gap: 0.5rem; }
    .stat-badge { font-size: 1rem; padding: 0.2rem 0.6rem; border-radius: 20px; background: var(--primary-dim); color: var(--primary); vertical-align: middle; margin-left: auto; }
    
    .card { background: var(--surface); padding: 2rem; border-radius: 16px; border: 1px solid var(--border); margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .card-header h3 { margin: 0; font-size: 1.25rem; color: var(--text); }
    
    table { width: 100%; border-collapse: separate; border-spacing: 0; }
    th, td { padding: 1.25rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
    th { color: var(--text-muted); font-weight: 500; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
    tr { transition: background 0.2s; }
    tr:hover td { background: var(--surface-hover); }
    tr:last-child td { border-bottom: none; }
    
    .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-pending { background: var(--alert-dim); color: var(--alert); }
    .status-ready { background: var(--primary-dim); color: var(--primary); }
    
    .login-wrapper { display: flex; height: 100vh; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1a1a24 0%, var(--bg) 100%); }
    form { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }
    input { padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border); background: #000; color: var(--text); font-size: 1rem; transition: border-color 0.2s; }
    input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-dim); }
    form button { padding: 1.25rem; border-radius: 12px; border: none; background: var(--primary); color: #000; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    form button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--primary-dim); }
    .error { color: var(--alert); text-align: center; margin-bottom: 1rem; background: var(--alert-dim); padding: 1rem; border-radius: 8px; font-size: 0.9rem; }
  </style>
`;

// GET /admin/login
router.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.redirect('/admin');
  }
  
  const errorMsg = req.query.error ? '<div class="error">Invalid credentials.</div>' : '';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - Hashcoin Admin</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;800&display=swap" rel="stylesheet">
      ${adminStyles}
    </head>
    <body style="padding: 0;">
      <div class="login-wrapper">
        <div class="card" style="width: 100%; max-width: 420px; padding: 3rem;">
          <h2 style="text-align: center; margin-bottom: 0.5rem;" class="brand"><span style="color: var(--primary);">#</span>HASHCOIN</h2>
          <p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">Premium Dashboard Login</p>
          ${errorMsg}
          <form method="POST" action="/admin/login">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Access Dashboard</button>
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
  let cashoutRows = '';
  
  if (stats.recentPurchases.length === 0) {
    tableRows = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No sales recorded yet.</td></tr>';
    cashoutRows = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No pending cashouts.</td></tr>';
  } else {
    stats.recentPurchases.forEach(p => {
      // General ledger row
      const date = new Date(p.paidAt).toLocaleDateString();
      const user = p.username ? '@' + p.username : p.telegramId;
      tableRows += `
        <tr>
          <td>${date}</td>
          <td style="font-weight: 500;">${user}</td>
          <td><span style="background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 6px;">${p.productCode}</span></td>
          <td style="color: var(--primary); font-weight: 700; text-align: right;">+${p.amount} XTR</td>
        </tr>
      `;
      
      // Cashout specific row
      const unlockDateObj = new Date(p.paidAt);
      unlockDateObj.setDate(unlockDateObj.getDate() + 21); // Telegram 21-day hold
      const unlockDate = unlockDateObj.toLocaleDateString();
      
      const isReady = new Date() >= unlockDateObj;
      const statusBadge = isReady 
        ? '<span class="status-badge status-ready">Ready</span>' 
        : '<span class="status-badge status-pending">Pending Hold</span>';

      cashoutRows += `
        <tr>
          <td><span style="color: var(--text-muted)">${p.productCode}</span></td>
          <td style="font-weight: 700;">${p.amount} XTR</td>
          <td>${unlockDate}</td>
          <td style="text-align: right;">${statusBadge}</td>
        </tr>
      `;
    });
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin Dashboard - Hashcoin</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      ${adminStyles}
    </head>
    <body>
      <div class="container">
        <div class="nav">
          <div class="brand"><span style="color: var(--primary);">#</span>HASHCOIN <span style="font-weight: 300; opacity: 0.5;">| Admin</span></div>
          <a href="/admin/logout" class="logout-btn">Logout</a>
        </div>
        
        <div class="grid">
          <div class="stat-card">
            <div class="stat-title">Total Revenue</div>
            <div class="stat-value">${stats.totalRevenueXTR} <span style="font-size: 1.5rem; color: var(--primary); margin-left: 0.5rem;">XTR</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Estimated Value (USD)</div>
            <div class="stat-value">$${stats.totalRevenueUSD}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Total Sales</div>
            <div class="stat-value">${stats.totalSales}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <!-- Cashout Schedule -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h3>Previsión de Cashout (Fragment)</h3>
            </div>
            <div style="background: rgba(0, 244, 203, 0.05); border: 1px solid var(--primary-dim); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="color: var(--primary); font-size: 0.85rem; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Pending Unlock</span>
                <div style="font-size: 2rem; font-weight: 800; margin-top: 0.25rem;">${stats.totalRevenueXTR} XTR</div>
              </div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div style="overflow-x: auto;">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Extracted</th>
                    <th>Unlock Date</th>
                    <th style="text-align: right;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${cashoutRows}
                </tbody>
              </table>
            </div>
          </div>

          <!-- General Ledger -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <h3>Últimas Ventas Oficiales</h3>
            </div>
            <div style="overflow-x: auto;">
              <table>
                <thead>
                  <tr>
                    <th>Invoice Date</th>
                    <th>Customer</th>
                    <th>SKU ID</th>
                    <th style="text-align: right;">Gross (XTR)</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 3rem; color: var(--text-muted); font-size: 0.85rem;">
          Hashcoin Bot Admin &copy; ${new Date().getFullYear()}
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
