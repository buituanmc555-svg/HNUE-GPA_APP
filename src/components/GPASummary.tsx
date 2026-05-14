import React from 'react';
import { calcGPA } from '../lib/calculator';
import { GRADE_SCALE } from '../lib/gradeScale';
import type { Subject } from '../types';

interface GPASummaryProps {
  subjects: Subject[];
}

export const GPASummary: React.FC<GPASummaryProps> = ({ subjects }) => {
  const gpa = calcGPA(subjects);
  const totalCredits = subjects.reduce((t, s) => t + s.credits, 0);
  const completedCredits = subjects.filter(s => s.scoreFinal !== undefined).reduce((t, s) => t + s.credits, 0);

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.6) return '#22c55e';
    if (gpa >= 3.2) return '#84cc16';
    if (gpa >= 2.5) return '#facc15';
    if (gpa >= 2.0) return '#fb923c';
    return '#ef4444';
  };

  const getGPALabel = (gpa: number) => {
    if (gpa >= 3.6) return 'Xuất Sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung Bình';
    if (gpa > 0) return 'Yếu';
    return '—';
  };

  const getCircleStroke = (gpa: number) => {
    return (gpa / 4.0) * 100;
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (getCircleStroke(gpa) / 100) * circumference;
  const color = getGPAColor(gpa);

  // Count grades
  const gradeCounts: Record<string, number> = {};
  subjects.forEach(s => {
    if (s.targetLetter) {
      gradeCounts[s.targetLetter] = (gradeCounts[s.targetLetter] || 0) + 1;
    }
  });

  return (
    <div className="gpa-summary-card">
      {/* GPA Circle */}
      <div className="gpa-circle-wrap">
        <svg viewBox="0 0 120 120" className="gpa-ring">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease' }}
          />
        </svg>
        <div className="gpa-value" style={{ color }}>
          <span className="gpa-number">{gpa.toFixed(2)}</span>
          <span className="gpa-max">/4.0</span>
        </div>
      </div>

      <div className="gpa-info">
        <div className="gpa-label" style={{ color }}>
          {getGPALabel(gpa)}
        </div>
        <div className="gpa-stats">
          <div className="stat-item">
            <span className="stat-num">{subjects.length}</span>
            <span className="stat-label">Môn học</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">{totalCredits}</span>
            <span className="stat-label">Tổng tín</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">{completedCredits}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
        </div>

        {/* Grade distribution */}
        {Object.keys(gradeCounts).length > 0 && (
          <div className="grade-dist">
            {Object.entries(gradeCounts).map(([letter, count]) => (
              <div key={letter} className="grade-pill" style={{
                background: `rgba(${getColorRgb(letter)}, 0.18)`,
                color: getColorHex(letter),
                border: `1px solid rgba(${getColorRgb(letter)}, 0.3)`
              }}>
                {letter} × {count}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function getColorHex(letter: string): string {
  const map: Record<string, string> = {
    'A': '#22c55e', 'B+': '#84cc16', 'B': '#a3e635',
    'C+': '#facc15', 'C': '#fb923c', 'D+': '#f97316',
    'D': '#ef4444', 'F': '#dc2626'
  };
  return map[letter] || '#94a3b8';
}

function getColorRgb(letter: string): string {
  const map: Record<string, string> = {
    'A': '34,197,94', 'B+': '132,204,22', 'B': '163,230,53',
    'C+': '250,204,21', 'C': '251,146,60', 'D+': '249,115,22',
    'D': '239,68,68', 'F': '220,38,38'
  };
  return map[letter] || '148,163,184';
}
