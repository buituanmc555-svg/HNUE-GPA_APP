import React, { useState, useMemo } from 'react';
import { Compass, Lightbulb } from 'lucide-react';
import type { Subject } from '../types';
import { calcGPA, isNonGPASubject } from '../lib/calculator';

interface DegreePlannerProps {
  subjects: Subject[];
}

export const DegreePlanner: React.FC<DegreePlannerProps> = ({ subjects }) => {
  const [totalCreditsProg, setTotalCreditsProg] = useState<number>(135);
  const [targetGradGpa, setTargetGradGpa] = useState<number>(3.2);

  // Calculate current accumulated credits and GPA from actual subjects
  const currentStats = useMemo(() => {
    const validSubjects = subjects.filter(s => !isNonGPASubject(s) && s.scoreFinal !== undefined);
    const accumulatedCredits = validSubjects.reduce((sum, s) => sum + s.credits, 0);
    const currentGpa = calcGPA(validSubjects);
    return { accumulatedCredits, currentGpa };
  }, [subjects]);

  const remainingCredits = Math.max(0, totalCreditsProg - currentStats.accumulatedCredits);

  const requiredGpa = useMemo(() => {
    if (remainingCredits <= 0) return null;
    const totalPointsNeeded = targetGradGpa * totalCreditsProg;
    const currentPoints = currentStats.currentGpa * currentStats.accumulatedCredits;
    const needed = (totalPointsNeeded - currentPoints) / remainingCredits;
    return needed;
  }, [targetGradGpa, totalCreditsProg, currentStats, remainingCredits]);

  const getFeasibility = (gpa: number | null) => {
    if (gpa === null) return { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (gpa > 4.0) return { label: 'Bất khả thi', color: 'bg-red-100 text-red-700 border-red-200' };
    if (gpa > 3.6) return { label: 'Cực khó', color: 'bg-red-100 text-red-700 border-red-200' };
    if (gpa > 3.2) return { label: 'Thử thách', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (gpa > 2.5) return { label: 'Khả thi', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: 'Dễ dàng', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  const getAdvice = (gpa: number | null) => {
    if (gpa === null) return "Bạn đã hoàn thành chương trình học!";
    if (gpa > 4.0) return "Mục tiêu này không thể đạt được với số tín chỉ còn lại. Hãy thử giảm mục tiêu.";
    if (gpa > 3.6) return "Bạn phải đạt điểm A cho gần như toàn bộ các môn còn lại.";
    if (gpa > 3.2) return "Bạn cần đạt tối thiểu B+ cho tất cả các môn từ giờ đến lúc ra trường. Không được phép có điểm B.";
    if (gpa > 2.5) return "Bạn cần duy trì mức điểm Khá (từ B trở lên) cho phần lớn các môn còn lại.";
    return "Bạn chỉ cần vượt qua các môn còn lại ở mức điểm trung bình khá.";
  };

  const feasibility = getFeasibility(requiredGpa);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 font-mono animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Compass className="w-6 h-6 text-brand-600" />
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Định vị Bằng cấp (Graduation GPS)</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Tính toán lộ trình điểm số cho các học kỳ còn lại để đạt hạng bằng mong muốn.
          </p>
        </div>
      </div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        
        {/* Left Column (Input Area) */}
        <div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng TC chương trình</label>
              <input 
                type="number" 
                value={totalCreditsProg}
                onChange={(e) => setTotalCreditsProg(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-bold text-sm shadow-sm transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">TC đã tích lũy (Cập nhật tự động)</label>
              <input 
                type="number" 
                disabled
                value={currentStats.accumulatedCredits}
                className="w-full px-4 py-3 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-bold text-sm shadow-sm transition-colors cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">GPA hiện tại (Cập nhật tự động)</label>
              <input 
                type="number" 
                step="0.01"
                disabled
                value={currentStats.currentGpa.toFixed(2)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-bold text-sm shadow-sm transition-colors cursor-not-allowed"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mục tiêu tốt nghiệp (Hạng bằng)</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Xuất sắc', gpa: 3.6, color: 'emerald' },
                  { label: 'Giỏi', gpa: 3.2, color: 'blue' },
                  { label: 'Khá', gpa: 2.5, color: 'amber' }
                ].map((goal) => {
                  const isActive = targetGradGpa === goal.gpa;
                  const activeClasses = {
                    emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 shadow-emerald-100',
                    blue: 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-blue-100',
                    amber: 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20 shadow-amber-100'
                  }[goal.color as 'emerald' | 'blue' | 'amber'];

                  return (
                    <button
                      key={goal.gpa}
                      onClick={() => setTargetGradGpa(goal.gpa)}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all shadow-sm
                        ${isActive 
                          ? `${activeClasses} scale-105 z-10 shadow-md` 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}
                      `}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{goal.label}</span>
                      <span className="text-lg font-black mt-1">{goal.gpa}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Result Dashboard) */}
        <div className="flex flex-col h-full">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden flex-1 border-l-4 border-l-brand-500 shadow-sm">
            {/* Top Stats */}
            <div className="text-sm font-bold text-slate-600 border-b border-slate-200/60 pb-3">
              Tín chỉ còn lại: <span className="text-slate-800">{remainingCredits} TC</span>
            </div>
            
            {/* The Big Number */}
            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">GPA trung bình cần đạt cho số TC còn lại:</label>
              <div className="flex items-end mt-2 space-x-3">
                <div className={`text-4xl font-black tracking-tight ${requiredGpa !== null && requiredGpa > 4.0 ? 'text-red-600' : 'text-brand-700'}`}>
                  {requiredGpa === null ? '-' : requiredGpa.toFixed(2)}
                </div>
                <span className={`${feasibility.color} text-xs px-2.5 py-1 rounded font-bold uppercase mb-1.5 shadow-sm`}>
                  {feasibility.label}
                </span>
              </div>
            </div>

            {/* Actionable Advice */}
            <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 flex items-start space-x-3 shadow-sm transition-all hover:border-amber-200">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                💡 Tương đương với việc: {getAdvice(requiredGpa)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

