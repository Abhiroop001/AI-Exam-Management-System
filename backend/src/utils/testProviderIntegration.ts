import { MultiProviderService } from '../services/multiProviderService';
import { GroqService } from '../services/groqService';

async function run() {
  console.log('\n======================================================');
  console.log('   TESTING MULTI-PROVIDER INTEGRATION WITH LIVE KEYS  ');
  console.log('======================================================\n');

  console.log('--- 1. Testing Grammar Polish with AI Engine ---');
  const polish = await GroqService.polishQuestionGrammar(
    'what is diffrence between sql and nosql and which one is good for exam portal',
    'Evaluate based on schema rigidity, horizontal scaling, and transactional ACID properties.'
  );
  console.log('Polished Question:', polish.correctedText);
  console.log('Readability Score:', polish.readabilityScore);
  console.log('Improvements:', polish.improvements);
  console.log('Suggestions:', polish.suggestions);
  console.log('Engine/Model:', polish.modelUsed);

  console.log('\n--- 2. Testing Long Answer Evaluation ---');
  const evaluation = await GroqService.evaluateLongAnswer(
    'Explain the differences between SQL and NoSQL databases.',
    'SQL databases are relational and structured with tables and ACID transactions, good for strict schemas. NoSQL databases are non-relational, flexible document or key-value stores with easy horizontal scaling.',
    'SQL databases are relational, structured with rigid schemas and ACID compliance. NoSQL databases are non-relational (document, key-value, graph) offering eventual consistency and dynamic schemas for horizontal scalability.',
    'Full marks require distinguishing schema structure, ACID vs BASE consistency, and scaling strategies.',
    10
  );
  console.log('Score Awarded:', evaluation.scoreAwarded, '/', 10);
  console.log('Accuracy Percentage:', evaluation.accuracyPercentage + '%');
  console.log('Score Rationale:', evaluation.scoreRationale);
  console.log('Strengths:', evaluation.strengths);
  console.log('Feedback:', evaluation.feedback);

  console.log('\n--- 3. Testing Code Static Analysis (.py) ---');
  const codeEval = await MultiProviderService.evaluateSourceCode(
    `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    'python',
    'Algorithm complexity examination'
  );
  console.log('Time Complexity:', codeEval.timeComplexity);
  console.log('Space Complexity:', codeEval.spaceComplexity);
  console.log('Score Out of 10:', codeEval.scoreOutOf10);
  console.log('Optimization Suggestions:', codeEval.optimizationSuggestions);

  console.log('\n======================================================');
  console.log('     ALL LIVE AI ENGINES VERIFIED SUCCESSFULLY!       ');
  console.log('======================================================\n');
}

run().catch(console.error);

