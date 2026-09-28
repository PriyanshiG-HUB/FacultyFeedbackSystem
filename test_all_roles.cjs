const puppeteer = require('puppeteer-core');
const axios = require('axios');

const API_BASE = 'http://127.0.0.1:8000/api';
const FRONTEND_BASE = 'http://127.0.0.1:3000';

async function checkOldToken(token) {
  try {
    const res = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.status;
  } catch (err) {
    return err.response ? err.response.status : 0;
  }
}

async function fillReactInput(page, selector, value) {
  await page.waitForSelector(selector);
  await page.focus(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type(selector, value);
}

async function testRole(browser, roleName, email, password, loginHash, logoutBtnId, expectedRedirectHash) {
  console.log(`\n======================================================`);
  console.log(`TESTING ROLE: ${roleName} (${email})`);
  console.log(`======================================================`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 776 });

  // Clear storage to isolate tests
  await page.goto(`${FRONTEND_BASE}/#Faculty/Login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());

  const isStudent = roleName === 'STUDENT';
  const emailSelector = isStudent ? '#college-email-or-university-roll-number' : 'input[type="email"]';
  const submitBtnSelector = isStudent ? '#student-submit-button' : '#faculty-login-submit-button';

  // 1. Navigate to login
  console.log(`1. Navigating to ${FRONTEND_BASE}/#${loginHash}...`);
  await page.goto(`${FRONTEND_BASE}/#${loginHash}`, { waitUntil: 'networkidle0' });

  // 2. Fill login form
  console.log('2. Submitting login credentials...');
  await fillReactInput(page, emailSelector, email);
  await fillReactInput(page, 'input[type="password"]', password);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    page.click(submitBtnSelector)
  ]);

  // 3. Wait for dashboard and logout button
  console.log(`3. Waiting for logout button #${logoutBtnId}...`);
  const logoutBtn = await page.waitForSelector(`#${logoutBtnId}`, { timeout: 20000 });
  const currentUrl = page.url();
  const tokenBefore = await page.evaluate(() => localStorage.getItem('sanctum_token'));
  const userBefore = await page.evaluate(() => localStorage.getItem('user_account_info'));
  console.log(`   Logged in URL: ${currentUrl}`);
  console.log(`   Active Token: ${tokenBefore?.substring(0, 15)}...`);
  console.log(`   User Info: ${userBefore ? JSON.parse(userBefore).role : 'none'}`);

  if (!tokenBefore) {
    throw new Error(`Login failed for ${roleName}: token is null`);
  }

  // Verify token is active in backend
  const meBefore = await checkOldToken(tokenBefore);
  console.log(`   Backend GET /auth/me before logout: ${meBefore} (Expected: 200)`);
  if (meBefore !== 200) {
    throw new Error(`Token before logout did not return 200: got ${meBefore}`);
  }

  // 4. Click logout button
  console.log(`4. Clicking #${logoutBtnId}...`);
  await page.$eval(`#${logoutBtnId}`, el => el.click());

  // Wait for redirect to login page
  console.log(`5. Waiting for redirect to #${expectedRedirectHash}...`);
  await page.waitForFunction(
    expected => window.location.hash.includes(expected),
    { timeout: 15000 },
    expectedRedirectHash
  );

  await new Promise(r => setTimeout(r, 1500));

  const urlAfter = page.url();
  const tokenAfter = await page.evaluate(() => localStorage.getItem('sanctum_token'));
  const userAfter = await page.evaluate(() => localStorage.getItem('user_account_info'));

  console.log(`   URL after logout: ${urlAfter}`);
  console.log(`   Token after logout: ${tokenAfter}`);
  console.log(`   User after logout: ${userAfter}`);

  if (tokenAfter !== null || userAfter !== null) {
    throw new Error(`Client session not cleared for ${roleName}`);
  }

  // 6. Verify Backend Token Revocation
  console.log('6. Verifying backend token revocation with old token...');
  const meAfter = await checkOldToken(tokenBefore);
  console.log(`   Backend GET /auth/me with old token: ${meAfter} (Expected: 401)`);
  if (meAfter !== 401) {
    throw new Error(`Backend token was NOT revoked! Status: ${meAfter}`);
  }

  // 7. Test page refresh
  console.log('7. Testing browser refresh on login page...');
  await page.reload({ waitUntil: 'networkidle0' });
  const urlAfterRefresh = page.url();
  const tokenAfterRefresh = await page.evaluate(() => localStorage.getItem('sanctum_token'));
  console.log(`   URL after refresh: ${urlAfterRefresh}`);
  console.log(`   Token after refresh: ${tokenAfterRefresh}`);
  if (!urlAfterRefresh.includes(expectedRedirectHash) || tokenAfterRefresh !== null) {
    throw new Error(`Session re-appeared after refresh!`);
  }

  // 8. Test browser back button
  console.log('8. Testing browser back button...');
  await page.goBack().catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  const urlAfterBack = page.url();
  const tokenAfterBack = await page.evaluate(() => localStorage.getItem('sanctum_token'));
  console.log(`   URL after back: ${urlAfterBack}`);
  console.log(`   Token after back: ${tokenAfterBack}`);
  if (tokenAfterBack !== null) {
    throw new Error(`Back button restored session token!`);
  }
  await page.close();

  // 9. Re-login test in a fresh page context
  console.log(`9. Testing re-login for ${roleName}...`);
  const rePage = await browser.newPage();
  await rePage.setViewport({ width: 1536, height: 776 });
  await rePage.goto(`${FRONTEND_BASE}/#${loginHash}`, { waitUntil: 'networkidle0' });

  await fillReactInput(rePage, emailSelector, email);
  await fillReactInput(rePage, 'input[type="password"]', password);

  await Promise.all([
    rePage.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    rePage.click(submitBtnSelector)
  ]);

  await rePage.waitForSelector(`#${logoutBtnId}`, { timeout: 20000 });
  const newReLoginToken = await rePage.evaluate(() => localStorage.getItem('sanctum_token'));
  console.log(`   New token after re-login: ${newReLoginToken?.substring(0, 15)}...`);
  console.log(`   Token differs from old: ${newReLoginToken !== tokenBefore}`);

  if (!newReLoginToken || newReLoginToken === tokenBefore) {
    throw new Error(`Re-login failed or issued duplicate token!`);
  }

  // Clean up re-login session
  await rePage.$eval(`#${logoutBtnId}`, el => el.click());
  await new Promise(r => setTimeout(r, 1500));
  await rePage.evaluate(() => localStorage.clear());
  await rePage.close();

  console.log(`>>> ROLE ${roleName} PASSED ALL TESTS 100% <<<\n`);
  return {
    login: 'PASS',
    dashboard: 'PASS',
    logout: 'PASS',
    oldToken: '401',
    relogin: 'PASS'
  };
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const matrix = {};

  try {
    matrix.ADMIN = await testRole(
      browser, 'ADMIN', 'admin@college.edu', 'password123',
      'Faculty/Login', 'topbar-logout-button', 'Faculty/Login'
    );

    matrix.HOD = await testRole(
      browser, 'HOD', 'dr.smith@college.edu', 'password123',
      'Faculty/Login', 'topbar-logout-button', 'Faculty/Login'
    );

    matrix.FACULTY = await testRole(
      browser, 'FACULTY', 'prof.jones@college.edu', 'password123',
      'Faculty/Login', 'faculty-logout-button', 'Faculty/Login'
    );

    matrix.STUDENT = await testRole(
      browser, 'STUDENT', '24it019@charusat.ac.in', '24IT019',
      'Student/Identify', 'student-logout-button', 'Student/Identify'
    );

    console.log('\n======================================================');
    console.log('TESTING DIRECT URL ACCESS TO PROTECTED ROUTES AFTER LOGOUT');
    console.log('======================================================');
    const page = await browser.newPage();
    const protectedTests = [
      { url: `${FRONTEND_BASE}/#Admin/Dashboard`, expected: 'Faculty/Login' },
      { url: `${FRONTEND_BASE}/#Admin/Departments/Index`, expected: 'Faculty/Login' },
      { url: `${FRONTEND_BASE}/#Faculty/MyReports/Index`, expected: 'Faculty/Login' },
      { url: `${FRONTEND_BASE}/#Student/Feedback/Show`, expected: 'Student/Identify' },
    ];

    for (const pt of protectedTests) {
      await page.goto(pt.url, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1200));
      const current = page.url();
      const token = await page.evaluate(() => localStorage.getItem('sanctum_token'));
      const isBlocked = current.includes(pt.expected) && token === null;
      console.log(`   Navigating to ${pt.url} -> Landed on ${current} (Blocked: ${isBlocked})`);
      if (!isBlocked) {
        throw new Error(`Protected route ${pt.url} was NOT blocked! Landed on ${current}`);
      }
    }
    await page.close();

    console.log('\n======================================================');
    console.log('COMPLETE VERIFICATION MATRIX');
    console.log('======================================================');
    console.table(matrix);

    console.log('\nALL TESTS PASSED SUCCESSFULLY (100%)!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('\nFAILED WITH ERROR:', err);
  process.exit(1);
});
