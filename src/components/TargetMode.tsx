import React, { useState } from 'react';
import type { Subject, ScenarioResult } from '../types';
import { calcSaveNetScenarios } from '../lib/calculator';
import { calcRequiredFinalScore } from '../lib/calculator';
import { GRADE_COLORS } from '../lib/gradeScale';
import { Target, Sparkles, AlertTriangle, Frown, PartyPopper, ChevronRight } from 'lucide-react';

interface TargetModeProps {
  subjects: Subject[];
  onApplyScenario: (scenario: ScenarioResult) => void;
}

export const TargetMode: React.FC<TargetModeProps> = ({ subjects, onApplyScenario }) => {
  const [targetGPA, setTargetGPA] = useState<string>('3.2');
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);

  const pendingSubjects = subjects.filter(s => s.scoreFinal === undefined);
  const lockedSubjects = subjects.filter(s => s.scoreFinal !== undefined);

  const handleCalculate = async () => {
    const gpa = parseFloat(targetGPA);
    if (isNaN(gpa) || gpa < 0 || gpa > 4) return;

    setLoading(true);
    // Small delay for visual feedback
    await new Promise(r => setTimeout(r, 300));
    const results = calcSaveNetScenarios(subjects, gpa);
    setScenarios(results);
    setCalculated(true);
    setLoading(false);
  };

  const totalCredits = subjects.reduce((t, s) => t + s.credits, 0);
  const maxPossibleGPA = 4.0;

  return (
    <div className="target-mode-wrap">
      {/* Header */}
      <div className="target-header">
        <div className="target-icon"><Target size={32} /></div>
        <div>
          <h2 className="target-title">Chế Độ Cứu Net</h2>
          <p className="target-subtitle">
            Nhập GPA mục tiêu — hệ thống tự tính kịch bản điểm cho {pendingSubjects.length} môn chưa thi
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="target-stats">
        <div className="tstat">
          <span className="tstat-num">{subjects.length}</span>
          <span className="tstat-label">Tổng môn</span>
        </div>
        <div className="tstat">
          <span className="tstat-num tstat-green">{lockedSubjects.length}</span>
          <span className="tstat-label">Đã có điểm</span>
        </div>
        <div className="tstat">
          <span className="tstat-num tstat-orange">{pendingSubjects.length}</span>
          <span className="tstat-label">Chưa thi</span>
        </div>
        <div className="tstat">
          <span className="tstat-num">{totalCredits}</span>
          <span className="tstat-label">Tổng tín chỉ</span>
        </div>
      </div>

      {/* Input */}
      <div className="target-input-row">
        <div className="gpa-input-wrap">
          <label className="gpa-input-label">GPA Mục Tiêu</label>
          <input
            type="number"
            className="gpa-input"
            min={0} max={4} step={0.05}
            value={targetGPA}
            onChange={e => {
              setTargetGPA(e.target.value);
              setCalculated(false);
            }}
            placeholder="VD: 3.2"
          />
          <span className="gpa-input-suffix">/4.0</span>
        </div>

        {/* Quick presets */}
        <div className="gpa-presets">
          {[2.0, 2.5, 3.0, 3.2, 3.5, 3.7].map(v => (
            <button
              key={v}
              className={`preset-btn ${targetGPA === String(v) ? 'active' : ''}`}
              onClick={() => { setTargetGPA(String(v)); setCalculated(false); }}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          className="btn-calculate"
          onClick={handleCalculate}
          disabled={loading || pendingSubjects.length === 0}
        >
          {loading ? (
            <span className="loading-dots">Đang tính<span className="dots">...</span></span>
          ) : (
            <span style={{display:'flex', alignItems:'center', gap:'6px'}}><Sparkles size={16} /> Tính Kịch Bản</span>
          )}
        </button>
      </div>

      {pendingSubjects.length === 0 && (
        <div className="no-pending-hint">
          <AlertTriangle size={18} /> Tất cả môn đã có điểm cuối kỳ. Thêm môn chưa thi để sử dụng chế độ này.
        </div>
      )}

      {/* Results */}
      {calculated && (
        <div className="scenarios-wrap">
          {scenarios.length === 0 ? (
            <div className="scenario-impossible">
              <div className="impossible-icon"><Frown size={48} className="text-danger" /></div>
              <h3>Không tìm được kịch bản khả thi</h3>
              <p>GPA mục tiêu <strong>{targetGPA}</strong> không thể đạt được với điểm thành phần hiện tại và số môn còn lại.</p>
              <p className="hint">Thử giảm mục tiêu GPA hoặc kiểm tra lại điểm các môn đã có.</p>
            </div>
          ) : (
            <>
              <div className="scenarios-title">
                <PartyPopper size={18} className="text-accent" /> Tìm được {scenarios.length} kịch bản cho mục tiêu GPA {targetGPA}
              </div>
              <div className="scenarios-grid">
                {scenarios.map((scenario, i) => (
                  <ScenarioCard
                    key={i}
                    scenario={scenario}
                    onApply={() => onApplyScenario(scenario)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface ScenarioCardProps {
  scenario: ScenarioResult;
  onApply: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onApply }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: scenario.labelColor }}></div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{scenario.icon}</span>
          <h3 className="font-bold text-slate-800" style={{ color: scenario.labelColor }}>{scenario.label}</h3>
        </div>
        <div className="px-2.5 py-1 rounded-lg text-xs font-black" style={{ backgroundColor: `${scenario.labelColor}15`, color: scenario.labelColor }}>
          GPA {scenario.achievedGPA.toFixed(2)}
        </div>
      </div>
      
      <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">{scenario.description}</p>
      
      <div className="space-y-2 mb-6 flex-1">
        {scenario.assignments.map(a => (
          <div key={a.subjectId} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
            <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{a.subjectName}</span>
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: `${GRADE_COLORS[a.grade]}20`, color: GRADE_COLORS[a.grade] }}>
                {a.grade}
              </span>
              <span className="text-[11px] font-bold text-slate-400">≥ {a.neededScore.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={onApply}
        className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center group/btn"
        style={{ backgroundColor: `${scenario.labelColor}10`, color: scenario.labelColor }}
      >
        Áp dụng lộ trình
        <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
