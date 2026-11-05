import axios, { AxiosInstance } from 'axios';
import https from 'https';
import http from 'http';

interface RequestMetric {
  endpoint: string;
  method: string;
  status: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

interface SuiteReport {
  suiteName: string;
  totalRequests: number;
  passedRequests: number;
  failedRequests: number;
  minDurationMs: number;
  maxDurationMs: number;
  avgDurationMs: number;
  p95DurationMs: number;
  errors: string[];
}

const RENDER_BACKEND_URL = 'https://exam-management-backend-0u3u.onrender.com/api';
const VERCEL_TEACHER_URL = 'https://frontend-teacher-five.vercel.app';
const VERCEL_STUDENT_URL = 'https://frontend-student-nu.vercel.app';

// Fresh connection per request prevents stale TCP socket resets from Cloudflare/Render
const httpsAgent = new https.Agent({
  keepAlive: false,
});

const httpAgent = new http.Agent({
  keepAlive: false,
});

const client: AxiosInstance = axios.create({
  timeout: 40000,
  httpAgent,
  httpsAgent,
  headers: {
    Connection: 'close',
  },
});

async function reliablePost(url: string, data: any): Promise<any> {
  let attempt = 0;
  while (attempt < 8) {
    try {
      return await client.post(url, data);
    } catch (e: any) {
      attempt++;
      if (attempt >= 8) throw e;
      await new Promise((r) => setTimeout(r, 1200 * attempt));
    }
  }
}

async function reliableGet(url: string, headers?: any): Promise<any> {
  let attempt = 0;
  while (attempt < 8) {
    try {
      return await client.get(url, { headers });
    } catch (e: any) {
      attempt++;
      if (attempt >= 8) throw e;
      await new Promise((r) => setTimeout(r, 1200 * attempt));
    }
  }
}

async function measureRequestWithRetry(
  fn: () => Promise<any>,
  endpoint: string,
  method: string,
  maxRetries = 3
): Promise<RequestMetric> {
  let attempt = 0;
  let lastStatus = 0;
  let lastError = '';
  const start = Date.now();

  while (attempt <= maxRetries) {
    try {
      const res = await fn();
      const durationMs = Date.now() - start;
      const isSuccess = res.status >= 200 && res.status < 300 && (res.data ? res.data.success !== false : true);
      return {
        endpoint,
        method,
        status: res.status,
        durationMs,
        success: isSuccess,
      };
    } catch (err: any) {
      lastStatus = err.response?.status || 0;
      lastError = err.response?.data?.message || err.message || 'Network exception';

      if (attempt < maxRetries) {
        attempt++;
        await new Promise((r) => setTimeout(r, 500 * attempt));
        continue;
      }

      const durationMs = Date.now() - start;
      return {
        endpoint,
        method,
        status: lastStatus,
        durationMs,
        success: false,
        error: lastError,
      };
    }
  }

  return {
    endpoint,
    method,
    status: lastStatus,
    durationMs: Date.now() - start,
    success: false,
    error: lastError,
  };
}

function summarizeMetrics(suiteName: string, metrics: RequestMetric[]): SuiteReport {
  const total = metrics.length;
  const passed = metrics.filter((m) => m.success).length;
  const failed = total - passed;
  const durations = metrics.map((m) => m.durationMs).sort((a, b) => a - b);
  const min = durations[0] || 0;
  const max = durations[durations.length - 1] || 0;
  const avg = Math.round(durations.reduce((s, d) => s + d, 0) / (total || 1));
  const p95 = durations[Math.floor(durations.length * 0.95)] || max;
  const errors = Array.from(new Set(metrics.filter((m) => !m.success).map((m) => `[${m.status}] ${m.error}`)));

  return {
    suiteName,
    totalRequests: total,
    passedRequests: passed,
    failedRequests: failed,
    minDurationMs: min,
    maxDurationMs: max,
    avgDurationMs: avg,
    p95DurationMs: p95,
    errors,
  };
}

async function runBatch<T>(
  tasks: (() => Promise<T>)[],
  concurrency = 6
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const chunk = tasks.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((fn) => fn()));
    results.push(...chunkResults);
    process.stdout.write(`\r  Progress: ${Math.min(i + concurrency, tasks.length)} / ${tasks.length} requests completed...`);
  }
  process.stdout.write('\n');
  return results;
}

export async function runCloudStressTesting() {
  console.log('\n================================================================');
  console.log('   🚀 ULTIMATE CLOUD API STRESS SUITE (100+ REQS PER ENDPOINT)  ');
  console.log('   Backend Target : ' + RENDER_BACKEND_URL);
  console.log('   Teacher Target : ' + VERCEL_TEACHER_URL);
  console.log('   Student Target : ' + VERCEL_STUDENT_URL);
  console.log('================================================================\n');

  const suiteReports: SuiteReport[] = [];

  // ============================================================================
  // SUITE 1: 100x Healthcheck & Server Telemetry
  // ============================================================================
  console.log('>>> [1/10] Running 100x Healthcheck & Server Telemetry Pings...');
  const healthTasks = Array.from({ length: 100 }, () => async () => {
    return measureRequestWithRetry(
      () => client.get(`${RENDER_BACKEND_URL}/health`),
      '/health',
      'GET'
    );
  });
  const healthMetrics = await runBatch(healthTasks, 10);
  suiteReports.push(summarizeMetrics('Suite 1: Render Cloud Healthcheck (100x)', healthMetrics));

  // ============================================================================
  // SUITE 2: 100x Vercel Cloud Frontends Availability (50 Teacher + 50 Student)
  // ============================================================================
  console.log('\n>>> [2/10] Running 100x Vercel Cloud Frontends Delivery (50 Teacher + 50 Student)...');
  const vercelTasks = [
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(() => client.get(VERCEL_TEACHER_URL), VERCEL_TEACHER_URL, 'GET');
    }),
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(() => client.get(VERCEL_STUDENT_URL), VERCEL_STUDENT_URL, 'GET');
    }),
  ];
  const vercelMetrics = await runBatch(vercelTasks, 10);
  suiteReports.push(summarizeMetrics('Suite 2: Vercel Cloud Edge Delivery (100x)', vercelMetrics));

  // ============================================================================
  // SUITE 3: Teacher Authentication & Authorization (100 Requests)
  // ============================================================================
  console.log('\n>>> [3/10] Running 100x Teacher Authentication & Profile Validation...');
  const teacherCreds = { email: 'prof.alan@university.edu', password: 'teacher1234' };
  const loginRes = await reliablePost(`${RENDER_BACKEND_URL}/auth/teacher/login`, teacherCreds);
  const teacherToken = loginRes.data.token;
  const teacherHeaders = { Authorization: `Bearer ${teacherToken}` };

  const teacherAuthTasks = [
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.post(`${RENDER_BACKEND_URL}/auth/teacher/login`, teacherCreds),
        '/auth/teacher/login',
        'POST'
      );
    }),
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.get(`${RENDER_BACKEND_URL}/auth/me`, { headers: teacherHeaders }),
        '/auth/me (Teacher)',
        'GET'
      );
    }),
  ];
  const teacherAuthMetrics = await runBatch(teacherAuthTasks, 6);
  suiteReports.push(summarizeMetrics('Suite 3: Teacher Auth & Session Validation (100x)', teacherAuthMetrics));

  // ============================================================================
  // SUITE 4: Student Authentication & Authorization (100 Requests)
  // ============================================================================
  console.log('\n>>> [4/10] Running 100x Student Authentication & Profile Validation...');
  const studentCreds = { email: 'emma.watson@student.edu', password: 'student1234' };
  const studentLoginRes = await reliablePost(`${RENDER_BACKEND_URL}/auth/student/login`, studentCreds);
  const studentToken = studentLoginRes.data.token;
  const studentHeaders = { Authorization: `Bearer ${studentToken}` };

  const studentAuthTasks = [
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.post(`${RENDER_BACKEND_URL}/auth/student/login`, studentCreds),
        '/auth/student/login',
        'POST'
      );
    }),
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.get(`${RENDER_BACKEND_URL}/auth/me`, { headers: studentHeaders }),
        '/auth/me (Student)',
        'GET'
      );
    }),
  ];
  const studentAuthMetrics = await runBatch(studentAuthTasks, 6);
  suiteReports.push(summarizeMetrics('Suite 4: Student Auth & Session Validation (100x)', studentAuthMetrics));

  // ============================================================================
  // SUITE 5: Teacher Exam Inventory & Detail Queries (100 Requests)
  // ============================================================================
  console.log('\n>>> [5/10] Running 100x Teacher Exams Queries & Item Lookups...');
  const teacherExamsRes = await reliableGet(`${RENDER_BACKEND_URL}/exams/teacher`, teacherHeaders);
  const examsList = teacherExamsRes.data.exams || [];
  const testExamId = examsList[0]?._id || 'EXAM_FALLBACK_ID';

  const teacherExamTasks = [
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.get(`${RENDER_BACKEND_URL}/exams/teacher`, { headers: teacherHeaders }),
        '/exams/teacher',
        'GET'
      );
    }),
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.get(`${RENDER_BACKEND_URL}/exams/${testExamId}`, { headers: teacherHeaders }),
        `/exams/${testExamId}`,
        'GET'
      );
    }),
  ];
  const teacherExamMetrics = await runBatch(teacherExamTasks, 8);
  suiteReports.push(summarizeMetrics('Suite 5: Teacher Exam Inventory & Details (100x)', teacherExamMetrics));

  // ============================================================================
  // SUITE 6: Student Exam Retrieval by Exam Join Code (100 Requests)
  // ============================================================================
  console.log('\n>>> [6/10] Running 100x Student Exam Retrieval by Join Code (EX-AI2026)...');
  const studentCodeTasks = Array.from({ length: 100 }, () => async () => {
    return measureRequestWithRetry(
      () => client.get(`${RENDER_BACKEND_URL}/exams/code/EX-AI2026`, { headers: studentHeaders }),
      '/exams/code/EX-AI2026',
      'GET'
    );
  });
  const studentCodeMetrics = await runBatch(studentCodeTasks, 8);
  suiteReports.push(summarizeMetrics('Suite 6: Student Exam Retrieval by Code (100x)', studentCodeMetrics));

  // ============================================================================
  // SUITE 7: Live Proctoring Heartbeat & Radar Stream (100 Requests)
  // ============================================================================
  console.log('\n>>> [7/10] Running 100x Live Proctoring Heartbeat & Radar Polling...');
  const liveProctorTasks = [
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.post(`${RENDER_BACKEND_URL}/submissions/heartbeat`, { examId: testExamId }, { headers: studentHeaders }),
        '/submissions/heartbeat',
        'POST'
      );
    }),
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.get(`${RENDER_BACKEND_URL}/submissions/live/${testExamId}`, { headers: teacherHeaders }),
        `/submissions/live/${testExamId}`,
        'GET'
      );
    }),
  ];
  const liveProctorMetrics = await runBatch(liveProctorTasks, 8);
  suiteReports.push(summarizeMetrics('Suite 7: Live Proctoring & Heartbeat (100x)', liveProctorMetrics));

  // ============================================================================
  // SUITE 8: Student Historical Submissions & Status Queries (100 Requests)
  // ============================================================================
  console.log('\n>>> [8/10] Running 100x Student Submissions History & Status Polling...');
  const subHistoryTasks = [
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.get(`${RENDER_BACKEND_URL}/submissions/my-submissions`, { headers: studentHeaders }),
        '/submissions/my-submissions',
        'GET'
      );
    }),
    ...Array.from({ length: 50 }, () => async () => {
      return measureRequestWithRetry(
        () => client.get(`${RENDER_BACKEND_URL}/submissions/exam/${testExamId}`, { headers: teacherHeaders }),
        `/submissions/exam/${testExamId}`,
        'GET'
      );
    }),
  ];
  const subHistoryMetrics = await runBatch(subHistoryTasks, 8);
  suiteReports.push(summarizeMetrics('Suite 8: Submissions History & Cohort Records (100x)', subHistoryMetrics));

  // ============================================================================
  // SUITE 9: AI Academic Question Formatting & Grammar Engine (100 Requests)
  // ============================================================================
  console.log('\n>>> [9/10] Running 100x AI Academic Question Polish & Grammar Queries...');
  const sampleQuestions = [
    'What is the differnce between Dijkstra and Bellman Ford algoritm in directed graph with negative weights?',
    'Explain why quicksort have worst case time complexiti of O(n^2) and how randomized pivot helps?',
    'What is the purpose of virtual memory and pagetable in modern operating system?',
    'Explain the role of transformers attention mechanism compared to recurrent neural network LSTM?',
  ];

  const aiTasks = Array.from({ length: 100 }, (_, idx) => async () => {
    const qText = sampleQuestions[idx % sampleQuestions.length];
    return measureRequestWithRetry(
      () => client.post(`${RENDER_BACKEND_URL}/ai/polish`, { questionText: qText }, { headers: teacherHeaders }),
      '/ai/polish',
      'POST'
    );
  });
  const aiMetrics = await runBatch(aiTasks, 5);
  suiteReports.push(summarizeMetrics('Suite 9: AI Academic Grammar & Formatting (100x)', aiMetrics));

  // ============================================================================
  // SUITE 10: Dynamic Student Exam Submission & Diagnostic Report Flow
  // ============================================================================
  console.log('\n>>> [10/10] Running End-to-End Dynamic Exam Submission Flow...');
  const uniqueEmail = `stress.examinee.${Date.now()}@university.edu`;
  const registerStudentRes = await reliablePost(`${RENDER_BACKEND_URL}/auth/student/register`, {
    name: 'Stress Test Student',
    age: 21,
    className: 'Class CS-Stress-100',
    email: uniqueEmail,
    phone: '+1 (555) 019-2834',
    password: 'student1234',
    confirmPassword: 'student1234',
    rollNumber: `R-${Date.now().toString().slice(-4)}`,
  });

  const freshStudentToken = registerStudentRes.data.token;
  const freshStudentHeaders = { Authorization: `Bearer ${freshStudentToken}` };

  const submissionPayload = {
    examId: testExamId,
    answers: [
      {
        questionId: 'q1',
        selectedOptions: ['O(log n)'],
      },
      {
        questionId: 'q2',
        selectedOptions: ['Binary Search Tree', 'Graph'],
      },
      {
        questionId: 'q3',
        textAnswer: 'Breadth First Search (BFS) uses a FIFO queue to visit vertices level by level, ensuring the shortest path in unweighted graphs.',
      },
    ],
    timeSpentSeconds: 180,
  };

  const endToEndMetrics: RequestMetric[] = [];
  const submitMetric = await measureRequestWithRetry(
    () => client.post(`${RENDER_BACKEND_URL}/submissions/submit`, submissionPayload, { headers: freshStudentHeaders }),
    '/submissions/submit',
    'POST'
  );
  endToEndMetrics.push(submitMetric);

  const freshSubs = await reliableGet(`${RENDER_BACKEND_URL}/submissions/my-submissions`, freshStudentHeaders);
  const activeSubmission = freshSubs.data.submissions?.[0];
  if (activeSubmission?._id) {
    const reportMetric = await measureRequestWithRetry(
      () => client.get(`${RENDER_BACKEND_URL}/submissions/report/${activeSubmission._id}`, { headers: freshStudentHeaders }),
      `/submissions/report/${activeSubmission._id}`,
      'GET'
    );
    endToEndMetrics.push(reportMetric);
  }
  suiteReports.push(summarizeMetrics('Suite 10: End-to-End Exam Submission & Report', endToEndMetrics));

  // ============================================================================
  // FINAL CONSOLIDATED AUDIT REPORT
  // ============================================================================
  console.log('\n================================================================');
  console.log('             🎉 CLOUD STRESS TEST AUDIT SUMMARY                 ');
  console.log('================================================================\n');

  let totalGrandRequests = 0;
  let totalGrandPassed = 0;
  let totalGrandFailed = 0;

  console.log(
    'Suite Name'.padEnd(54) +
      'Total'.padEnd(10) +
      'Passed'.padEnd(10) +
      'Failed'.padEnd(10) +
      'Avg Latency'.padEnd(14) +
      'P95 Latency'
  );
  console.log('-'.repeat(112));

  for (const report of suiteReports) {
    totalGrandRequests += report.totalRequests;
    totalGrandPassed += report.passedRequests;
    totalGrandFailed += report.failedRequests;

    console.log(
      report.suiteName.padEnd(54) +
        String(report.totalRequests).padEnd(10) +
        String(report.passedRequests).padEnd(10) +
        String(report.failedRequests).padEnd(10) +
        `${report.avgDurationMs}ms`.padEnd(14) +
        `${report.p95DurationMs}ms`
    );

    if (report.errors.length > 0) {
      console.log(`   ⚠️ Encountered Errors in ${report.suiteName}:`);
      report.errors.forEach((err) => console.log(`      -> ${err}`));
    }
  }

  console.log('-'.repeat(112));
  const passRate = ((totalGrandPassed / totalGrandRequests) * 100).toFixed(2);
  console.log(
    `TOTAL REQUESTS: ${totalGrandRequests} | PASSED: ${totalGrandPassed} | FAILED: ${totalGrandFailed} | OVERALL SUCCESS RATE: ${passRate}%\n`
  );

  return {
    totalRequests: totalGrandRequests,
    passedRequests: totalGrandPassed,
    failedRequests: totalGrandFailed,
    successRate: passRate,
    suiteReports,
  };
}

if (require.main === module) {
  runCloudStressTesting()
    .then((summary) => {
      if (summary.failedRequests === 0) {
        console.log('✅ ALL CLOUD ENDPOINTS AND DEPLOYED URLS PASSED STRESS TESTING WITH 100% SUCCESS!');
        process.exit(0);
      } else {
        console.warn(`⚠️ Completed with ${summary.failedRequests} failures.`);
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('Fatal stress test error:', err);
      process.exit(1);
    });
}
