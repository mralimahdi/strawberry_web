const fetch = global.fetch;
const fs = require('fs');
const base = 'http://localhost:5000';

const tests = [];

function addTest(name, fn) {
  tests.push({ name, fn });
}

function report(result) {
  console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  if (!result.passed) {
    console.log('   reason:', result.reason);
  }
}

addTest('GET home page', async () => {
  const res = await fetch(`${base}/index.html`);
  const text = await res.text();
  if (!res.ok) throw new Error(`status ${res.status}`);
  if (!text.includes('<title>')) throw new Error('Page HTML missing title');
});

addTest('GET admin login page', async () => {
  const res = await fetch(`${base}/admin/login.html`);
  if (!res.ok) throw new Error(`status ${res.status}`);
});

addTest('GET admin dashboard page', async () => {
  const res = await fetch(`${base}/admin/dashboard.html`);
  if (!res.ok) throw new Error(`status ${res.status}`);
});

addTest('GET login page', async () => {
  const res = await fetch(`${base}/login.html`);
  if (!res.ok) throw new Error(`status ${res.status}`);
});

addTest('GET user register page', async () => {
  const res = await fetch(`${base}/register.html`);
  const text = await res.text();
  if (!res.ok) throw new Error(`status ${res.status}`);
  if (!text.includes('id="registerForm"')) throw new Error('register form missing');
  if (!text.includes('/api/register')) throw new Error('register form not wired to /api/register');
});

addTest('GET admin reply page', async () => {
  const res = await fetch(`${base}/admin/reply_message.html`);
  const text = await res.text();
  if (!res.ok) throw new Error(`status ${res.status}`);
  if (!text.includes('/api/dashboard/messages/reply')) throw new Error('reply page not wired to reply endpoint');
});

addTest('POST admin login valid', async () => {
  const res = await fetch(`${base}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@strawberryfarm.test', password: 'Admin@123' })
  });
  const json = await res.json();
  if (!json.success || json.role !== 'admin') throw new Error(`unexpected response ${JSON.stringify(json)}`);
});

addTest('POST user login invalid', async () => {
  const res = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'tony@example.com', password: 'wrongpass' })
  });
  if (res.status !== 401) throw new Error(`expected 401 got ${res.status}`);
});

addTest('POST register new user', async () => {
  const uniqueEmail = `qa_user_${Date.now()}@test.local`;
  const payload = {
    role: 'user',
    name: 'QA Register',
    email: uniqueEmail,
    phone: '+1234567890',
    password: 'QaPass123!'
  };
  const res = await fetch(`${base}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!json.success) throw new Error(`unexpected response ${JSON.stringify(json)}`);
  const loginRes = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: uniqueEmail, password: 'QaPass123!' })
  });
  if (!loginRes.ok) throw new Error(`login failed with status ${loginRes.status}`);
  const loginJson = await loginRes.json();
  if (loginJson.message !== 'Login successful') throw new Error(`unexpected login response ${JSON.stringify(loginJson)}`);
});

addTest('GET dashboard new orders', async () => {
  const res = await fetch(`${base}/api/dashboard/orders/new`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error('expected array');
  if (json.length === 0) throw new Error('expected at least one order');
});

addTest('GET dashboard completed orders', async () => {
  const res = await fetch(`${base}/api/dashboard/orders/completed`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error('expected array');
});

addTest('GET dashboard booked tours', async () => {
  const res = await fetch(`${base}/api/dashboard/tours/booked`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error('expected array');
  if (json.length === 0) throw new Error('expected at least one tour');
});

addTest('GET dashboard messages', async () => {
  const res = await fetch(`${base}/api/dashboard/messages`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error('expected array');
  if (json.length === 0) throw new Error('expected at least one message');
});

addTest('GET dashboard customers', async () => {
  const res = await fetch(`${base}/api/dashboard/customers`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error('expected array');
  if (json.length === 0) throw new Error('expected at least one customer');
});

addTest('POST contact message', async () => {
  const payload = {
    name: 'QA Tester',
    email: 'qa@test.local',
    phone: '+1234567890',
    message: 'Automated contact form test'
  };
  const res = await fetch(`${base}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!json.success) throw new Error(`unexpected response ${JSON.stringify(json)}`);
});

addTest('POST forgot password request (existing email)', async () => {
  const res = await fetch(`${base}/api/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tony@example.com' })
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const json = await res.json();
  if (!json.message || !json.message.includes('Password reset instructions')) throw new Error(`unexpected response ${JSON.stringify(json)}`);
});

addTest('POST admin reply to a message', async () => {
  const listRes = await fetch(`${base}/api/dashboard/messages`);
  const messages = await listRes.json();
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('no messages available');
  const message = messages[0];
  const res = await fetch(`${base}/api/dashboard/messages/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messageId: message.srno,
      fromEmail: 'admin@strawberryfarm.test',
      toEmail: message.email,
      message: 'Automated admin reply test.'
    })
  });
  const json = await res.json();
  if (!json.success) throw new Error(`unexpected reply response ${JSON.stringify(json)}`);
});

addTest('POST reset password using token', async () => {
  const tokensRaw = fs.readFileSync('reset-tokens.json', 'utf8');
  const tokens = JSON.parse(tokensRaw);
  const entries = Object.entries(tokens);
  if (!entries.length) throw new Error('no reset tokens found');
  const [token, tokenData] = entries[entries.length - 1];
  const res = await fetch(`${base}/api/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email: tokenData.email, password: 'NewPass123!' })
  });
  const json = await res.json();
  if (!json.success) throw new Error(`unexpected reset response ${JSON.stringify(json)}`);
});

addTest('POST complete a new order', async () => {
  const firstOrderRes = await fetch(`${base}/api/dashboard/orders/new`);
  const orders = await firstOrderRes.json();
  if (!orders.length) throw new Error('no new order available');
  const orderId = orders[0].id;
  const completeRes = await fetch(`${base}/api/dashboard/orders/${orderId}/complete`, {
    method: 'POST'
  });
  const completeJson = await completeRes.json();
  if (!completeJson.success) throw new Error(`unexpected complete response ${JSON.stringify(completeJson)}`);
});

(async () => {
  console.log('Starting full website test suite...');
  for (const test of tests) {
    try {
      await test.fn();
      report({ name: test.name, passed: true });
    } catch (err) {
      report({ name: test.name, passed: false, reason: err.message });
    }
  }
  console.log('Test suite finished.');
})();
