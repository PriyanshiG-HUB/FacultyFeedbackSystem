const http = require('http');

const API_HOST = '127.0.0.1';
const API_PORT = 8000;

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      host: API_HOST,
      port: API_PORT,
      path: `/api${path}`,
      method: method,
      headers: headers,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Authenticating Admin User ---');
  const loginRes = await request('POST', '/auth/login', {
    email: 'admin@college.edu',
    password: 'password123',
  });
  console.log('Login Status:', loginRes.status);
  const token = loginRes.data?.token;
  if (!token) {
    console.error('Failed to log in as admin!');
    process.exit(1);
  }
  console.log('Token received:', token.substring(0, 15) + '...');

  console.log('\n--- 2. Fetching Datasets List ---');
  const datasetsRes = await request('GET', '/data-imports/datasets', null, token);
  console.log('Datasets Status:', datasetsRes.status);
  const datasets = datasetsRes.data?.data || [];
  console.log(`Found ${datasets.length} datasets registered:`, datasets.map(d => d.key).join(', '));

  console.log('\n--- 3. Testing Validation & Execution for All 14 Tables ---');

  const testPayloads = {
    department: [{ department_code: 'TEST_DEPT', department_name: 'Test Department', status: 'ACTIVE' }],
    designation: [{ designation_name: 'Senior Lecturer', status: 'ACTIVE' }],
    academic_year: [{ year_code: '2027-2028', title: 'Academic Year 2027-2028', start_date: '2027-07-01', end_date: '2028-06-30', status: 'ACTIVE' }],
    semester: [{ semester_no: '8', term: 'EVEN' }],
    batch: [{ batch_title: '2025-2029', department_code: 'TEST_DEPT', start_year: '2025', end_year: '2029', current_semester_no: '1', status: 'ACTIVE' }],
    division: [{ division_code: 'DIV_X', batch_title: '2025-2029', department_code: 'TEST_DEPT', semester_no: '1', status: 'ACTIVE' }],
    section: [{ section_code: 'SEC_Y', division_code: 'DIV_X', batch_title: '2025-2029', status: 'ACTIVE' }],
    faculty: [{ full_name: 'Dr. Test Professor', email: 'test.prof@college.edu', mobile: '9998887770', department_code: 'TEST_DEPT', designation: 'Senior Lecturer', status: 'ACTIVE' }],
    student: [{ roll_no: 'TEST2025001', enrollment_no: 'ENTEST001', full_name: 'Test Student', email: 'test.student@college.edu', mobile: '9998887771', department_code: 'TEST_DEPT', batch_title: '2025-2029', division_code: 'DIV_X', section_code: 'SEC_Y', status: 'ACTIVE' }],
    subject: [{ subject_code: 'TEST801', subject_name: 'Advanced Software Testing', department_code: 'TEST_DEPT', semester_no: '8', course_type: 'CORE', credits: '4.0', status: 'ACTIVE' }],
    subject_offering: [{ subject_code: 'TEST801', batch_title: '2025-2029', year_code: '2027-2028', enrollment_capacity: '60', status: 'OPEN' }],
    teaching_assignment: [{ subject_code: 'TEST801', faculty_email: 'test.prof@college.edu', batch_title: '2025-2029', year_code: '2027-2028', semester_no: '8', division_code: 'DIV_X', section_code: 'SEC_Y', status: 'ACTIVE' }],
    student_elective_enrollment: [{ roll_no: 'TEST2025001', subject_code: 'TEST801', batch_title: '2025-2029', year_code: '2027-2028', status: 'ENROLLED' }],
    feedback_question_category: [{ category_name: 'Test Innovation Category', display_order: '99' }],
  };

  for (const [key, rows] of Object.entries(testPayloads)) {
    console.log(`\n--> Testing Table [${key}]...`);

    // 1. Validate API
    const valRes = await request('POST', '/data-imports/validate', { dataset_key: key, rows: rows }, token);
    console.log(`   Validation: HTTP ${valRes.status} | Success: ${valRes.data?.success} | Valid Rows: ${valRes.data?.valid_rows_count}/${valRes.data?.total_rows}`);

    if (!valRes.data?.success || valRes.data?.valid_rows_count === 0) {
      console.error(`   VALIDATION FAILED for [${key}]:`, valRes.data?.errors);
      process.exit(1);
    }

    // 2. Execute Import API
    const execRes = await request('POST', '/data-imports/execute', { dataset_key: key, rows: valRes.data.valid_rows, file_name: `test_${key}.csv` }, token);
    console.log(`   Execution: HTTP ${execRes.status} | Success: ${execRes.data?.success} | Imported: ${execRes.data?.imported_count} record(s)`);

    if (!execRes.data?.success) {
      console.error(`   EXECUTION FAILED for [${key}]:`, execRes.data?.message);
      process.exit(1);
    }
  }

  console.log('\n--- 4. Fetching Data Import Logs ---');
  const logsRes = await request('GET', '/data-import-logs', null, token);
  console.log('Import Logs Status:', logsRes.status);
  const logs = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data?.data || []);
  console.log(`Successfully verified ${logs.length} import log entries recorded in database!`);

  console.log('\n>>> ALL 14 TABLES END-TO-END DATA IMPORT TESTS PASSED 100%! <<<');
}

run().catch(console.error);
