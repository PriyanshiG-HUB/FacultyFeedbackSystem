const axios = require('axios');

const API_BASE = 'http://127.0.0.1:8000/api';

const accounts = [
  { role: 'ADMIN', email: 'admin@college.edu', password: 'password123' },
  { role: 'HOD', email: 'dr.smith@college.edu', password: 'password123' },
  { role: 'FACULTY', email: 'prof.jones@college.edu', password: 'password123' },
  { role: 'STUDENT', email: '24it019@charusat.ac.in', password: '24IT019' },
];

async function testApiLifecycle() {
  console.log('=== TESTING API AUTH LIFECYCLE FOR ALL 4 ROLES ===\n');
  const results = {};

  for (const acc of accounts) {
    console.log(`--- Testing Role: ${acc.role} (${acc.email}) ---`);
    try {
      // 1. LOGIN
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: acc.email,
        password: acc.password,
      });
      const token = loginRes.data.token;
      console.log(`[${acc.role}] 1. Login Status:`, loginRes.status, 'Token length:', token ? token.length : 0);

      // 2. GET /api/auth/me BEFORE LOGOUT
      const meBeforeRes = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`[${acc.role}] 2. GET /auth/me BEFORE logout:`, meBeforeRes.status, 'User:', meBeforeRes.data.user?.email, 'Role:', meBeforeRes.data.user?.role);

      // 3. POST /api/auth/logout
      const logoutRes = await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`[${acc.role}] 3. POST /auth/logout Status:`, logoutRes.status, 'Response:', logoutRes.data);

      // 4. GET /api/auth/me AFTER LOGOUT (OLD TOKEN - MUST BE 401)
      let oldTokenStatus = null;
      try {
        await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        oldTokenStatus = 200; // Should not happen!
        console.error(`[${acc.role}] 4. ERROR: Old token still returned 200!`);
      } catch (err) {
        oldTokenStatus = err.response ? err.response.status : err.message;
        console.log(`[${acc.role}] 4. GET /auth/me AFTER logout with old token:`, oldTokenStatus, '(Expected: 401)');
      }

      // 5. RE-LOGIN
      const reloginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: acc.email,
        password: acc.password,
      });
      const newToken = reloginRes.data.token;
      console.log(`[${acc.role}] 5. Re-login Status:`, reloginRes.status, 'New Token different from old:', newToken !== token);

      results[acc.role] = {
        login: loginRes.status === 200 ? 'PASS' : 'FAIL',
        meBefore: meBeforeRes.status === 200 ? 'PASS' : 'FAIL',
        logout: logoutRes.status === 200 ? 'PASS' : 'FAIL',
        oldToken401: oldTokenStatus === 401 ? 'PASS (401)' : `FAIL (${oldTokenStatus})`,
        relogin: reloginRes.status === 200 ? 'PASS' : 'FAIL',
      };
    } catch (err) {
      console.error(`[${acc.role}] FAILED:`, err.response?.data || err.message);
      results[acc.role] = { error: err.response?.data || err.message };
    }
    console.log('');
  }

  console.log('=== SUMMARY TABLE ===');
  console.table(results);
}

testApiLifecycle().catch(console.error);
