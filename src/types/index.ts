import { GradeLetter } from '../lib/gradeScale';
export type { GradeLetter };

export interface Subject {
  id: string;
  name: string;
  credits: number;

  // Component weights (0.0 - 1.0)
  weightCC: number;   // Chuyên cần
  weightDK: number;   // Điều kiện
  weightFinal: number; // Cuối kỳ

  // Known scores
  scoreCC: number;    // Only 5 or 10
  scoreDK: number;    // 0 - 10

  // Target
  targetLetter: GradeLetter; // "A", "B+", "B", etc.
  
  // Final exam score (known = locked, undefined = pending)
  scoreFinal?: number;
  
  // Semester Grouping
  semesterId?: string;
}

export interface GradeEntry {
  min10: number;
  sys4: number;
}

export interface ScenarioResult {
  label: string;
  labelColor: string;
  icon: string;
  assignments: { subjectId: string; subjectName: string; grade: string; neededScore: number }[];
  achievedGPA: number;
  isPossible: boolean;
  description: string;
}

export interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  subjects: Subject[];
  targetGPA?: number;
}
