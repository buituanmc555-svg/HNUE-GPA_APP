import { GRADE_SCALE, GRADE_LETTERS } from './gradeScale';
import type { Subject, ScenarioResult } from '../types';

// ─────────────────────────────────────────────────────────────
// Logic 1: Calculate required final exam score for a subject
// Formula: X = (Target10 - scoreCC*weightCC - scoreDK*weightDK) / weightFinal
// ─────────────────────────────────────────────────────────────
export interface FinalScoreResult {
  score: number | null;
  status: 'ok' | 'impossible' | 'already_achieved' | 'config_error';
  message: string;
}

export function calcRequiredFinalScore(subject: Subject): FinalScoreResult {
  const { weightCC, weightDK, weightFinal, scoreCC, scoreDK, targetLetter } = subject;

  // Edge case: weight configuration error
  const weightSum = weightCC + weightDK + weightFinal;
  if (Math.abs(weightSum - 1.0) > 0.001) {
    return {
      score: null,
      status: 'config_error',
      message: `Tổng trọng số = ${weightSum.toFixed(2)} ≠ 1.0. Vui lòng kiểm tra lại.`
    };
  }

  const gradeEntry = GRADE_SCALE[targetLetter];
  if (!gradeEntry) {
    return { score: null, status: 'config_error', message: `Không tìm thấy thang điểm cho "${targetLetter}"` };
  }

  const target10 = gradeEntry.min10;
  const X = (target10 - scoreCC * weightCC - scoreDK * weightDK) / weightFinal;

  // Edge case: impossible
  if (X > 10) {
    return {
      score: null,
      status: 'impossible',
      message: `Bất khả thi! Cần ${X.toFixed(2)}/10 — Điểm thành phần quá thấp.`
    };
  }

  // Edge case: already achieved (don't even need to take exam)
  if (X <= 0) {
    return {
      score: 0,
      status: 'already_achieved',
      message: 'Chỉ cần nộp bài là đạt (điểm thành phần đã đủ).'
    };
  }

  return {
    score: Number(X.toFixed(2)), // Keep precise up to 2 decimals
    status: 'ok',
    message: `Cần tối thiểu ${X.toFixed(2)}/10 ở cuối kỳ.`
  };
}

// ─────────────────────────────────────────────────────────────
// Logic 2: Calculate GPA from list of subjects (What-if Analysis)
// GPA = Σ(sys4 × credits) / Σ(credits)
// ─────────────────────────────────────────────────────────────
// Check if a subject should be excluded from GPA (PE, Military, etc.)
export function isNonGPASubject(subject: { code?: string; name: string }): boolean {
  const EXCLUDE_PREFIXES = ['PHYE', 'PHYF', 'DEFE', 'DEFF', 'MIL'];
  const code = subject.code?.toUpperCase() || '';
  const isExcludedCode = EXCLUDE_PREFIXES.some(p => code.startsWith(p));
  const hasAsterisk = subject.name.includes('*');
  return isExcludedCode || hasAsterisk;
}

export function calcGPA(subjects: Subject[]): number {
  let totalCredits = 0;
  let weightedSum = 0;
  
  subjects.forEach(s => {
    if (isNonGPASubject(s)) return;
    
    // For GPA calculation, we only care about completed subjects or targets
    const isCompleted = s.scoreFinal !== undefined;
    const letter = isCompleted 
      ? getLetterFrom10(s.scoreCC * s.weightCC + s.scoreDK * s.weightDK + (s.scoreFinal! * s.weightFinal))
      : (s.targetLetter || 'B');
      
    const sys4 = GRADE_SCALE[letter]?.sys4 || 0;
    weightedSum += sys4 * s.credits;
    totalCredits += s.credits;
  });
  
  return totalCredits === 0 ? 0 : weightedSum / totalCredits;
}

// Compute weighted score sum for subjects with final scores locked
export function calcLockedWeightedSum(subjects: Subject[]): { sum: number; credits: number } {
  const locked = subjects.filter(s => s.scoreFinal !== undefined && !isNonGPASubject(s));
  const credits = locked.reduce((t, s) => t + s.credits, 0);
  const sum = locked.reduce((t, s) => {
    const weighted10 = s.scoreCC * s.weightCC + s.scoreDK * s.weightDK + (s.scoreFinal! * s.weightFinal);
    // Convert to sys4
    const letter = getLetterFrom10(weighted10);
    const entry = GRADE_SCALE[letter];
    return t + (entry ? entry.sys4 * s.credits : 0);
  }, 0);
  return { sum, credits };
}

// Convert 10-scale score to letter grade
export function getLetterFrom10(score10: number): string {
  // Round to 1 decimal place as per university standard
  // Add a tiny epsilon to handle floating point precision issues (e.g., 7.7499999)
  const rounded = Math.round((score10 + 0.0001) * 10) / 10;
  
  if (rounded >= 8.5) return 'A';
  if (rounded >= 7.8) return 'B+';
  if (rounded >= 7.0) return 'B';
  if (rounded >= 6.3) return 'C+';
  if (rounded >= 5.5) return 'C';
  if (rounded >= 4.8) return 'D+';
  if (rounded >= 4.0) return 'D';
  return 'F';
}

// ─────────────────────────────────────────────────────────────
// Logic 3: "Cứu Net" — Scenario Engine (Backtracking)
// Find grade combinations for remaining subjects to hit targetGPA
// ─────────────────────────────────────────────────────────────
export function calcSaveNetScenarios(
  subjects: Subject[],
  targetGPA: number
): ScenarioResult[] {
  const totalCredits = subjects.reduce((t, s) => t + s.credits, 0);
  if (totalCredits === 0) return [];

  // Subjects with known final scores
  const locked = subjects.filter(s => s.scoreFinal !== undefined);
  const pending = subjects.filter(s => s.scoreFinal === undefined);

  // Current weighted sum from locked subjects
  const lockedWeightedSum = locked.reduce((t, s) => {
    const weighted10 = s.scoreCC * s.weightCC + s.scoreDK * s.weightDK + (s.scoreFinal! * s.weightFinal);
    const letter = getLetterFrom10(weighted10);
    const entry = GRADE_SCALE[letter];
    return t + (entry ? entry.sys4 * s.credits : 0);
  }, 0);

  const needed = targetGPA * totalCredits - lockedWeightedSum;
  const pendingCredits = pending.reduce((t, s) => t + s.credits, 0);

  if (pending.length === 0) {
    return [];
  }

  // Find all feasible combinations by brute-force (for small N it's fine)
  const feasible: { assignments: Record<string, string>; gpa: number; totalSys4: number }[] = [];

  function backtrack(idx: number, currentSys4Sum: number, assignments: Record<string, string>) {
    if (idx === pending.length) {
      const achievedGPA = (lockedWeightedSum + currentSys4Sum) / totalCredits;
      if (achievedGPA >= targetGPA - 0.001) {
        feasible.push({ assignments: { ...assignments }, gpa: achievedGPA, totalSys4: currentSys4Sum });
      }
      return;
    }

    // Prune: even if all remaining get A, can we reach target?
    const remaining = pending.slice(idx).reduce((t, s) => t + s.credits * 4.0, 0);
    const maxPossibleGPA = (lockedWeightedSum + currentSys4Sum + remaining) / totalCredits;
    if (maxPossibleGPA < targetGPA - 0.001) return;

    const subject = pending[idx];
    for (const letter of GRADE_LETTERS) {
      const entry = GRADE_SCALE[letter];
      const sys4Points = entry.sys4 * subject.credits;

      // Check if this grade is achievable for this subject
      const finalResult = calcRequiredFinalScore({ ...subject, targetLetter: letter });
      if (finalResult.status === 'impossible') continue;

      assignments[subject.id] = letter;
      backtrack(idx + 1, currentSys4Sum + sys4Points, assignments);
      delete assignments[subject.id];

      // Limit feasible to avoid huge arrays
      if (feasible.length >= 200) return;
    }
  }

  backtrack(0, 0, {});

  if (feasible.length === 0) return [];

  // Sort by GPA achieved (ascending — prefer the minimum)
  feasible.sort((a, b) => a.gpa - b.gpa);

  // Build the 3 scenarios

  // Scenario 1: "An toàn" — most evenly distributed (closest to equal distribution)
  const safeScenario = findBalancedScenario(feasible, pending);

  // Scenario 2: "Tập trung môn tín cao" — max credits get highest grades
  const focusHighCreditScenario = findHighCreditFocusScenario(feasible, pending);

  // Scenario 3: "Tối thiểu" — lowest possible grades (just barely pass)
  const minScenario = feasible[0];

  const buildResult = (
    scenario: typeof feasible[0],
    label: string,
    labelColor: string,
    icon: string,
    description: string
  ): ScenarioResult => {
    const assignments = pending.map(s => {
      const grade = scenario.assignments[s.id] || 'F';
      const finalResult = calcRequiredFinalScore({ ...s, targetLetter: grade });
      return {
        subjectId: s.id,
        subjectName: s.name,
        grade,
        neededScore: finalResult.score ?? 0
      };
    });
    return { label, labelColor, icon, assignments, achievedGPA: scenario.gpa, isPossible: true, description };
  };

  const results: ScenarioResult[] = [];

  if (safeScenario) {
    results.push(buildResult(
      safeScenario,
      'Kịch bản An Toàn',
      '#22c55e',
      '🟢',
      'Điểm phân bổ đều, không cần nỗ lực quá nhiều ở bất kỳ môn nào.'
    ));
  }

  if (focusHighCreditScenario && focusHighCreditScenario !== safeScenario) {
    results.push(buildResult(
      focusHighCreditScenario,
      'Dồn Lực Môn Tín Cao',
      '#f59e0b',
      '🟡',
      'Tập trung ôn môn nhiều tín chỉ để kéo GPA, môn nhỏ có thể thả lỏng hơn.'
    ));
  }

  if (minScenario && minScenario !== safeScenario && minScenario !== focusHighCreditScenario) {
    results.push(buildResult(
      minScenario,
      'Kịch bản Liều Lĩnh',
      '#ef4444',
      '🔴',
      'Điểm tối thiểu để đạt mục tiêu — rủi ro cao nếu thi không như kỳ vọng.'
    ));
  }

  // Ensure we have at least some result
  if (results.length === 0 && feasible.length > 0) {
    results.push(buildResult(feasible[0], 'Kịch bản Khả Thi', '#22c55e', '🟢', 'Đây là cách đơn giản nhất để đạt mục tiêu.'));
  }

  return results;
}

function findBalancedScenario(
  feasible: { assignments: Record<string, string>; gpa: number; totalSys4: number }[],
  pending: Subject[]
) {
  // Find the scenario where variance of sys4 values is smallest
  let minVariance = Infinity;
  let best = feasible[0];

  for (const f of feasible) {
    const values = pending.map(s => GRADE_SCALE[f.assignments[s.id] || 'F'].sys4);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    if (variance < minVariance) {
      minVariance = variance;
      best = f;
    }
  }

  return best;
}

function findHighCreditFocusScenario(
  feasible: { assignments: Record<string, string>; gpa: number; totalSys4: number }[],
  pending: Subject[]
) {
  // Sort pending by credits descending
  const sorted = [...pending].sort((a, b) => b.credits - a.credits);
  const highCreditIds = sorted.slice(0, Math.ceil(pending.length / 2)).map(s => s.id);

  // Find scenario where high-credit subjects have highest grades
  let bestScore = -Infinity;
  let best = feasible[0];

  for (const f of feasible) {
    const highScore = highCreditIds.reduce((t, id) => {
      return t + (GRADE_SCALE[f.assignments[id] || 'F'].sys4 * 2);
    }, 0);
    const lowScore = pending
      .filter(s => !highCreditIds.includes(s.id))
      .reduce((t, s) => t + GRADE_SCALE[f.assignments[s.id] || 'F'].sys4, 0);
    const total = highScore - lowScore;
    if (total > bestScore) {
      bestScore = total;
      best = f;
    }
  }

  return best;
}
