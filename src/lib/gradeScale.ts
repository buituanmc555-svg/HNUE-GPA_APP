import type { GradeEntry } from '../types';

export const GRADE_SCALE: Record<string, GradeEntry> = {
  "A":  { min10: 8.5, sys4: 4.0 },
  "B+": { min10: 7.8, sys4: 3.5 },
  "B":  { min10: 7.0, sys4: 3.0 },
  "C+": { min10: 6.3, sys4: 2.5 },
  "C":  { min10: 5.5, sys4: 2.0 },
  "D+": { min10: 4.8, sys4: 1.5 },
  "D":  { min10: 4.0, sys4: 1.0 },
  "F":  { min10: 0.0, sys4: 0.0 }
};

export const GRADE_LETTERS = ["A", "B+", "B", "C+", "C", "D+", "D", "F"] as const;
export type GradeLetter = typeof GRADE_LETTERS[number];

// Colors for each grade letter
export const GRADE_COLORS: Record<string, string> = {
  "A":  "#22c55e",
  "B+": "#84cc16",
  "B":  "#a3e635",
  "C+": "#facc15",
  "C":  "#fb923c",
  "D+": "#f97316",
  "D":  "#ef4444",
  "F":  "#dc2626"
};

export const GRADE_BG: Record<string, string> = {
  "A":  "rgba(34, 197, 94, 0.15)",
  "B+": "rgba(132, 204, 22, 0.15)",
  "B":  "rgba(163, 230, 53, 0.15)",
  "C+": "rgba(250, 204, 21, 0.15)",
  "C":  "rgba(251, 146, 60, 0.15)",
  "D+": "rgba(249, 115, 22, 0.15)",
  "D":  "rgba(239, 68, 68, 0.15)",
  "F":  "rgba(220, 38, 38, 0.15)"
};

export const DEFAULT_WEIGHTS = {
  weightCC: 0.1,
  weightDK: 0.3,
  weightFinal: 0.6
};
