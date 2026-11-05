interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASSED' | 'FAILED';
  statusCode: number;
  message: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runApiTestSuite() {
  console.log('\n======================================================');
  console.log('   STARTING FULL-SCALE END-TO-END API SUITE TEST      ');
  console.log('   Target: http://localhost:5000/api                 ');
  console.log('======================================================\n');

  const baseUrl = 'http://localhost:5000/api';

  let teacherToken = '';
  let studentToken = '';
  let createdExamId = '';
  let createdExamCode = '';
  let testSubmissionId = '';

  const executeTest = async (
    name: string,
    method: string,
    url: string,
    body?: any,
    headers?: Record<string, string>
  ) => {
    const start = Date.now();
    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data: any = await response.json().catch(() => ({}));
      const duration = Date.now() - start;
      const passed = response.status >= 200 && response.status < 300 && data.success !== false;

      results.push({
        endpoint: url,
        method,
        status: passed ? 'PASSED' : 'FAILED',
        statusCode: response.status,
        message: passed ? (data.message || 'OK') : (data.message || `HTTP ${response.status}`),
        durationMs: duration,
      });

      console.log(
        `${passed ? '✅' : '❌'} [${method}] ${url} -> ${response.status} (${duration}ms): ${
          data.message || (passed ? 'Success' : 'Failed')
        }`
      );

      return { ok: passed, status: response.status, data };
    } catch (err: any) {
      const duration = Date.now() - start;
      results.push({
        endpoint: url,
        method,
        status: 'FAILED',
        statusCode: 500,
        message: err.message,
        durationMs: duration,
      });
      console.log(`❌ [${method}] ${url} -> ERROR: ${err.message}`);
      return { ok: false, status: 500, data: null };
    }
  };

  // 0. Health check
  console.log('--- 0. Checking Backend Health ---');
  await executeTest('Health Check', 'GET', '/health');

  // 1. Teacher Auth - Login
  console.log('\n--- 1. Testing Teacher Authentication & Profile ---');
  const teacherLogin = await executeTest(
    'Teacher Login',
    'POST',
    '/auth/teacher/login',
    {
      email: 'prof.alan@university.edu',
      password: 'teacher1234',
    }
  );

  if (teacherLogin.ok && teacherLogin.data.token) {
    teacherToken = teacherLogin.data.token;
  }

  // 2. Teacher Profile
  await executeTest('Teacher Me Profile', 'GET', '/auth/me', undefined, {
    Authorization: `Bearer ${teacherToken}`,
  });

  // 3. Student Auth - Login
  console.log('\n--- 2. Testing Student Authentication & Profile ---');
  const studentLogin = await executeTest(
    'Student Login',
    'POST',
    '/auth/student/login',
    {
      email: 'emma.watson@student.edu',
      password: 'student1234',
    }
  );

  if (studentLogin.ok && studentLogin.data.token) {
    studentToken = studentLogin.data.token;
  }

  // 4. Student Profile
  await executeTest('Student Me Profile', 'GET', '/auth/me', undefined, {
    Authorization: `Bearer ${studentToken}`,
  });

  // 5. AI Question Polish & Clarity
  console.log('\n--- 3. Testing AI Question Grammar & Polish ---');
  const polishRes = await executeTest('AI Polish Question', 'POST', '/ai/polish', {
    questionText: 'What is difference between stack and queue and how they behave in memory?',
  });
  if (polishRes.ok && polishRes.data.result) {
    console.log(`   * AI Refined: "${polishRes.data.result.correctedText}"`);
    console.log(`   * Readability Score: ${polishRes.data.result.readabilityScore}/100`);
  }

  // 6. Exam Creation by Teacher
  console.log('\n--- 4. Testing Exam Authoring & QR Generation ---');
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 3);

  const examPayload = {
    title: 'Automated Diagnostic Verification Benchmark',
    subject: 'Computer Science & Algorithms',
    description: 'End-to-end integration test validating multi-model AI evaluation.',
    durationMinutes: 45,
    expiresAt: expiry.toISOString(),
    questions: [
      {
        id: 'q-suite-1',
        questionText: 'Which sorting algorithm guarantees worst-case time complexity of O(N log N)?',
        type: 'single_mcq',
        options: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Insertion Sort'],
        correctAnswers: ['Merge Sort'],
        remarks: 'Merge sort always divides array in half and merges in linear time, guaranteeing O(N log N).',
        marks: 2,
        negativeMarks: 0,
      },
      {
        id: 'q-suite-2',
        questionText: 'Select all features that characterize modern microservice architectures:',
        type: 'multi_mcq',
        options: ['Independent Deployment', 'Single Shared Monolithic DB Only', 'Decentralized Data Management', 'Fault Isolation'],
        correctAnswers: ['Independent Deployment', 'Decentralized Data Management', 'Fault Isolation'],
        remarks: 'Microservices rely on independent deployment, decentralized data per service, and fault isolation.',
        marks: 3,
        negativeMarks: 0,
      },
      {
        id: 'q-suite-3',
        questionText: 'Explain the purpose and function of the learning rate hyperparameter in Gradient Descent optimization.',
        type: 'long_answer',
        options: [],
        correctAnswers: [],
        idealAnswer: 'The learning rate scales the magnitude of parameter updates with respect to the gradient loss function. A rate that is too high causes oscillation or divergence, while a rate that is too low leads to slow convergence or getting trapped in local minima.',
        remarks: 'Look for discussion of step size, gradient magnitude, risk of divergence if too large, and slow convergence if too small.',
        marks: 5,
        negativeMarks: 0,
      },
    ],
  };

  const examRes = await executeTest('Teacher Create Exam', 'POST', '/exams', examPayload, {
    Authorization: `Bearer ${teacherToken}`,
  });

  if (examRes.ok && examRes.data.exam) {
    createdExamId = examRes.data.exam._id;
    createdExamCode = examRes.data.exam.code;
    console.log(`   * Created Exam ID: ${createdExamId}, Code: ${createdExamCode}`);
    console.log(`   * QR Code generated: ${examRes.data.exam.qrCodeDataUrl ? 'YES (Base64 PNG)' : 'NO'}`);
  }

  // 7. Teacher List Exams
  await executeTest('Teacher List Exams', 'GET', '/exams/teacher', undefined, {
    Authorization: `Bearer ${teacherToken}`,
  });

  // 8. Student Join Exam by Code
  console.log('\n--- 5. Testing Student Exam Fetch & Proctor Heartbeat ---');
  await executeTest(`Student Get Exam by Code [${createdExamCode}]`, 'GET', `/exams/code/${createdExamCode}`, undefined, {
    Authorization: `Bearer ${studentToken}`,
  });

  // 9. Heartbeat Ping
  await executeTest('Live Session Heartbeat', 'POST', '/submissions/heartbeat', {
    examId: createdExamId,
  }, {
    Authorization: `Bearer ${studentToken}`,
  });

  // 10. Teacher Live Proctoring Monitor
  console.log('\n--- 6. Testing Live Proctor Monitor ---');
  const liveRes = await executeTest(`Teacher Monitor Live [${createdExamId}]`, 'GET', `/submissions/live/${createdExamId}`, undefined, {
    Authorization: `Bearer ${teacherToken}`,
  });
  if (liveRes.ok) {
    console.log(`   * Active Live Students: ${liveRes.data.activeCount}`);
  }

  // 11. Student Answer Submission
  console.log('\n--- 7. Testing Student Submission & Multi-Model AI Evaluation ---');
  const submissionPayload = {
    examId: createdExamId,
    timeSpentSeconds: 320,
    answers: [
      {
        questionId: 'q-suite-1',
        selectedOptions: ['Merge Sort'],
        textAnswer: '',
      },
      {
        questionId: 'q-suite-2',
        selectedOptions: ['Independent Deployment', 'Decentralized Data Management', 'Fault Isolation'],
        textAnswer: '',
      },
      {
        questionId: 'q-suite-3',
        selectedOptions: [],
        textAnswer: 'The learning rate is a hyperparameter that controls how much to adjust the weights of our network with respect to the loss gradient. If the learning rate is too large, the algorithm can overshoot the global minimum and diverge. If it is too small, convergence will be extremely slow and can get stuck in sub-optimal local minima.',
      },
    ],
  };

  const submitRes = await executeTest('Student Submit Exam', 'POST', '/submissions/submit', submissionPayload, {
    Authorization: `Bearer ${studentToken}`,
  });

  if (submitRes.ok && submitRes.data.submissionId) {
    testSubmissionId = submitRes.data.submissionId;
    console.log(`   * Submission Created ID: ${testSubmissionId}`);
  }

  // Give the async AI analysis pipeline a brief window to complete background grading
  console.log('   * Waiting 3 seconds for AI Analysis Engine to finalize...');
  await new Promise((r) => setTimeout(r, 3000));

  // 12. Poll Analysis Status
  console.log('\n--- 8. Testing Post-Exam Analysis Status ---');
  await executeTest(`Get Analysis Status [${testSubmissionId}]`, 'GET', `/submissions/status/${testSubmissionId}`, undefined, {
    Authorization: `Bearer ${studentToken}`,
  });

  // 13. Student Comprehensive Diagnostic Report
  console.log('\n--- 9. Testing Student AI Report Retrieval ---');
  const studentReportRes = await executeTest(`Get Student Report [${testSubmissionId}]`, 'GET', `/submissions/report/${testSubmissionId}`, undefined, {
    Authorization: `Bearer ${studentToken}`,
  });

  if (studentReportRes.ok && studentReportRes.data.submission) {
    const sub = studentReportRes.data.submission;
    console.log(`   * Student Score: ${sub.totalScore}/${sub.maxScore} (${sub.percentage}%)`);
    console.log(`   * Performance Tier: ${sub.studentReport?.performanceTier}`);
    console.log(`   * AI Summary: ${sub.studentReport?.overallSummary?.slice(0, 100)}...`);
    console.log(`   * Mastery Breakdown topics: ${sub.studentReport?.conceptBreakdown?.length}`);
    console.log(`   * Personalized Learning Steps: ${sub.studentReport?.personalizedLearningPlan?.length}`);
  }

  // 14. Teacher Diagnostic Report
  console.log('\n--- 10. Testing Teacher Diagnostic Report Retrieval ---');
  const teacherReportRes = await executeTest(`Get Teacher Report [${testSubmissionId}]`, 'GET', `/submissions/teacher-report/${testSubmissionId}`, undefined, {
    Authorization: `Bearer ${teacherToken}`,
  });

  if (teacherReportRes.ok && teacherReportRes.data.submission) {
    const tReport = teacherReportRes.data.submission.teacherReport;
    console.log(`   * Pedagogical Insight: ${tReport?.pedagogicalInsight?.slice(0, 100)}...`);
    console.log(`   * Actionable Class Recs: ${tReport?.actionableInterventions?.length}`);
  }

  // 15. Teacher View All Submissions For Exam
  console.log('\n--- 11. Testing Exam Submissions List ---');
  await executeTest(`Get Submissions for Exam [${createdExamId}]`, 'GET', `/submissions/exam/${createdExamId}`, undefined, {
    Authorization: `Bearer ${teacherToken}`,
  });

  // Final Summary Table
  console.log('\n======================================================');
  console.log('             API TEST EXECUTION SUMMARY               ');
  console.log('======================================================');
  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  const failedCount = results.filter((r) => r.status === 'FAILED').length;

  console.table(
    results.map((r) => ({
      Method: r.method,
      Endpoint: r.endpoint,
      Status: r.status,
      Code: r.statusCode,
      'Time (ms)': r.durationMs,
      Summary: r.message.slice(0, 45),
    }))
  );

  console.log(`Total Tests: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  if (failedCount === 0) {
    console.log('\n🎉 ALL APIS PASSED 100% WITH VERIFIED STATUS CODES AND LIVE RESPONSES!\n');
  } else {
    console.error(`\n⚠️ ${failedCount} API test(s) failed.\n`);
  }
}

runApiTestSuite().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
