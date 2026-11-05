import { Submission, ISubmission } from '../models/Submission';
import { Exam, IQuestion } from '../models/Exam';
import { Student } from '../models/Student';
import { GroqService } from './groqService';

export class AIAnalysisEngine {
  /**
   * Processes a student submission through full AI grading & analytical synthesis
   */
  static async processSubmission(submissionId: string): Promise<ISubmission | null> {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      console.error(`[AI Analysis Engine]: Submission ${submissionId} not found.`);
      return null;
    }

    const exam = await Exam.findById(submission.examId);
    if (!exam) {
      console.error(`[AI Analysis Engine]: Exam ${submission.examId} not found.`);
      return null;
    }

    const student = await Student.findById(submission.studentId);
    const studentName = student ? student.name : 'Student';
    const studentClass = student ? student.className : 'Class';

    let runningTotalScore = 0;
    let runningMaxScore = 0;
    const evaluatedQuestionsData: any[] = [];

    // Map questions for quick lookup
    const questionMap = new Map<string, IQuestion>();
    exam.questions.forEach((q) => questionMap.set(q.id, q));

    // Evaluate each student answer against teacher remarks & ideal answers
    for (const ans of submission.answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      runningMaxScore += q.marks;
      let scoreAwarded = 0;
      let evaluationDetails: any = {
        feedback: '',
        strengths: [],
        weaknesses: [],
        scoreRationale: '',
        accuracyPercentage: 0,
      };

      if (q.type === 'single_mcq') {
        const selected = ans.selectedOptions?.[0];
        const correct = q.correctAnswers?.[0];
        if (selected && correct && selected.trim().toLowerCase() === correct.trim().toLowerCase()) {
          scoreAwarded = q.marks;
          evaluationDetails = {
            feedback: `Correct! ${q.remarks ? 'Remark: ' + q.remarks : 'Accurate selection.'}`,
            strengths: ['Selected the correct option directly.'],
            weaknesses: [],
            scoreRationale: `Full marks awarded (${q.marks}/${q.marks}) for matching the correct key.`,
            accuracyPercentage: 100,
          };
        } else {
          const neg = q.negativeMarks || 0;
          scoreAwarded = -neg;
          evaluationDetails = {
            feedback: `Incorrect. The correct answer was: ${correct || 'N/A'}. ${q.remarks ? 'Teacher note: ' + q.remarks : ''}`,
            strengths: [],
            weaknesses: ['Chose an incorrect distractor.'],
            scoreRationale: neg > 0 ? `Incorrect answer with negative deduction of -${neg}.` : 'Zero points awarded for incorrect choice.',
            accuracyPercentage: 0,
          };
        }
      } else if (q.type === 'multi_mcq') {
        const studentSelected = (ans.selectedOptions || []).map(s => s.trim().toLowerCase()).sort();
        const correctKeys = (q.correctAnswers || []).map(s => s.trim().toLowerCase()).sort();

        const correctHits = studentSelected.filter(s => correctKeys.includes(s)).length;
        const incorrectHits = studentSelected.filter(s => !correctKeys.includes(s)).length;

        if (correctHits === correctKeys.length && incorrectHits === 0) {
          scoreAwarded = q.marks;
          evaluationDetails = {
            feedback: `Excellent! All correct options identified. ${q.remarks ? 'Teacher Remarks: ' + q.remarks : ''}`,
            strengths: ['Identified every valid multi-select choice without picking distractors.'],
            weaknesses: [],
            scoreRationale: `Full marks (${q.marks}/${q.marks}) for complete accuracy.`,
            accuracyPercentage: 100,
          };
        } else if (correctHits > 0 && incorrectHits === 0) {
          // Partial credit
          const partialRatio = correctHits / correctKeys.length;
          scoreAwarded = Math.round(partialRatio * q.marks * 10) / 10;
          evaluationDetails = {
            feedback: `Partially correct (${correctHits}/${correctKeys.length} items found). ${q.remarks ? 'Remarks: ' + q.remarks : ''}`,
            strengths: ['Identified partial correct subset.'],
            weaknesses: ['Missed one or more correct options.'],
            scoreRationale: `Partial credit awarded (${scoreAwarded}/${q.marks}).`,
            accuracyPercentage: Math.round(partialRatio * 100),
          };
        } else {
          scoreAwarded = 0;
          evaluationDetails = {
            feedback: `Incorrect selection. Expected: ${q.correctAnswers.join(', ')}. ${q.remarks ? 'Remarks: ' + q.remarks : ''}`,
            strengths: [],
            weaknesses: ['Selected non-matching options or omitted key answers.'],
            scoreRationale: 'No points awarded.',
            accuracyPercentage: 0,
          };
        }
      } else if (q.type === 'long_answer') {
        // Deep AI evaluation using Groq / HF models
        const longEval = await GroqService.evaluateLongAnswer(
          q.questionText,
          ans.textAnswer || '',
          q.idealAnswer || '',
          q.remarks || '',
          q.marks
        );

        scoreAwarded = longEval.scoreAwarded;
        evaluationDetails = {
          feedback: longEval.feedback,
          strengths: longEval.strengths,
          weaknesses: longEval.weaknesses,
          scoreRationale: longEval.scoreRationale,
          accuracyPercentage: longEval.accuracyPercentage,
        };
      }

      ans.scoreAwarded = scoreAwarded;
      ans.maxScore = q.marks;
      ans.aiEvaluation = evaluationDetails;
      runningTotalScore += Math.max(0, scoreAwarded);

      evaluatedQuestionsData.push({
        questionId: q.id,
        questionText: q.questionText,
        type: q.type,
        marks: q.marks,
        scoreAwarded,
        teacherRemarks: q.remarks,
        idealAnswer: q.idealAnswer,
        studentAnswer: q.type === 'long_answer' ? ans.textAnswer : ans.selectedOptions,
        evaluation: evaluationDetails,
      });
    }

    const calculatedPercentage = runningMaxScore > 0 ? Math.round((runningTotalScore / runningMaxScore) * 100) : 0;

    submission.totalScore = runningTotalScore;
    submission.maxScore = runningMaxScore;
    submission.percentage = calculatedPercentage;

    // Generate comprehensive Student & Teacher reports
    const [studentReport, teacherReport] = await Promise.all([
      GroqService.generateStudentReport(
        exam.title,
        studentName,
        evaluatedQuestionsData,
        runningTotalScore,
        runningMaxScore
      ),
      GroqService.generateTeacherReport(
        exam.title,
        studentName,
        studentClass,
        evaluatedQuestionsData,
        runningTotalScore,
        runningMaxScore
      ),
    ]);

    submission.studentReport = studentReport;
    submission.teacherReport = teacherReport;
    submission.analysisStatus = 'completed';
    submission.analysisCompletedAt = new Date();

    await submission.save();
    console.log(`[AI Analysis Engine]: Completed analysis for student ${studentName} on exam "${exam.title}" (${calculatedPercentage}%).`);

    return submission;
  }
}

