import React, { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, Plus, Trash2, Check, ChevronDown } from 'lucide-react';
import type { Subject } from '../types';
import { getLetterFrom10, isNonGPASubject } from '../lib/calculator';
import { GRADE_SCALE, GRADE_LETTERS, type GradeLetter } from '../lib/gradeScale';

interface RetakeOptimizerProps {
  subjects: Subject[];
}

export const RetakeOptimizer: React.FC<RetakeOptimizerProps> = ({ subjects }) => {
  const [simulatedIds, setSimulatedIds] = useState<Record<string, GradeLetter>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Completed subjects available for retake
  const completedSubjects = useMemo(() => {
    return subjects
      .filter(s => !isNonGPASubject(s) && s.scoreFinal !== undefined)
      .map(s => {
        const current10 = s.scoreCC * s.weightCC + s.scoreDK * s.weightDK + (s.scoreFinal! * s.weightFinal);
        const currentLetter = getLetterFrom10(current10);
        return { ...s, currentLetter };
      });
  }, [subjects]);

  const totalCredits = useMemo(() => {
    return completedSubjects.reduce((sum, s) => sum + s.credits, 0);
  }, [completedSubjects]);

  // ROI Suggestions (Smart Scanning)
  const smartSuggestions = useMemo(() => {
    return completedSubjects
      .map(s => {
        const currentSys4 = GRADE_SCALE[s.currentLetter as GradeLetter]?.sys4 || 0;
        if (currentSys4 >= 3.5) return null; // Skip if already good
        const boost = ((3.5 - currentSys4) * s.credits) / totalCredits;
        return { ...s, boost };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null && !simulatedIds[s.id])
      .sort((a, b) => b.boost - a.boost)
      .slice(0, 2);
  }, [completedSubjects, totalCredits, simulatedIds]);

  const addSimulation = (id: string, target: GradeLetter = 'A') => {
    setSimulatedIds(prev => ({ ...prev, [id]: target }));
    setIsDropdownOpen(false);
  };

  const removeSimulation = (id: string) => {
    const next = { ...simulatedIds };
    delete next[id];
    setSimulatedIds(next);
  };

  const updateTarget = (id: string, target: GradeLetter) => {
    setSimulatedIds(prev => ({ ...prev, [id]: target }));
  };

  // Calculate Total Impact
  const totalBoost = useMemo(() => {
    let boost = 0;
    Object.entries(simulatedIds).forEach(([id, target]) => {
      const sub = completedSubjects.find(s => s.id === id);
      if (sub) {
        const oldSys4 = GRADE_SCALE[sub.currentLetter as GradeLetter]?.sys4 || 0;
        const newSys4 = GRADE_SCALE[target]?.sys4 || 0;
        boost += ((newSys4 - oldSys4) * sub.credits) / totalCredits;
      }
    });
    return boost;
  }, [simulatedIds, completedSubjects, totalCredits]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono animate-fade-in">
      
      {/* Summary Header */}
      <div className="bg-white border border-brand-200 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-gradient-to-br from-white to-brand-50/20">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center justify-center md:justify-start">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-500 mr-2 md:mr-3" />
            Tối ưu Học Cải thiện
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium italic md:not-italic">Giả lập việc học lại các môn cũ để xem GPA của bạn sẽ thay đổi thế nào.</p>
        </div>
        
        <div className="bg-brand-600 text-white p-4 md:p-5 rounded-2xl shadow-lg shadow-brand-600/30 text-center min-w-full md:min-w-[180px]">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">GPA Tăng thêm</div>
          <div className="text-3xl md:text-4xl font-black">+{totalBoost.toFixed(3)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Smart Suggestions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center px-2">
            Gợi ý ROI cao nhất
          </h3>
          {smartSuggestions.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400 text-center">
              Chưa tìm thấy môn phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0 lg:space-y-4">
              {smartSuggestions.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => addSimulation(s.id, 'B+')}
                  className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-brand-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-sm text-slate-700 truncate max-w-[120px]">{s.name}</div>
                    <span className="text-[10px] font-black text-brand-600">ROI +{s.boost.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-[10px] text-slate-400">Từ {s.currentLetter} lên B+</div>
                    <Plus className="w-4 h-4 text-brand-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Manual Simulation List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
              Danh sách giả lập ({Object.keys(simulatedIds).length})
            </h3>
            
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-black border border-brand-100 hover:bg-brand-100 transition-colors"
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Chọn môn
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                  {completedSubjects.filter(s => !simulatedIds[s.id]).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-400 italic">Hết môn khả dụng</div>
                  )}
                  {completedSubjects.filter(s => !simulatedIds[s.id]).map(s => (
                    <div 
                      key={s.id}
                      onClick={() => addSimulation(s.id)}
                      className="px-4 py-2 hover:bg-brand-50 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.credits} TC • Hiện tại: {s.currentLetter}</span>
                      </div>
                      <Plus className="w-3 h-3 text-brand-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(simulatedIds).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <Plus className="w-6 h-6 md:w-8 md:h-8 mb-2 opacity-20" />
                <p className="text-xs md:text-sm font-bold">Hãy chọn môn bạn muốn cải thiện</p>
                <p className="text-[10px] mt-1 italic text-center px-4">Dữ liệu sẽ được đồng bộ từ bảng điểm của bạn.</p>
              </div>
            ) : (
              Object.entries(simulatedIds).map(([id, target]) => {
                const s = completedSubjects.find(sub => sub.id === id);
                if (!s) return null;
                const oldSys4 = GRADE_SCALE[s.currentLetter as GradeLetter]?.sys4 || 0;
                const newSys4 = GRADE_SCALE[target]?.sys4 || 0;
                const itemBoost = ((newSys4 - oldSys4) * s.credits) / totalCredits;

                return (
                  <div key={id} className="p-3 md:p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 md:gap-4 group hover:border-brand-200 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs md:text-sm truncate">{s.name}</span>
                        <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase shrink-0">{s.credits} TC</span>
                      </div>
                      <div className="flex items-center mt-2 text-[10px] md:text-[11px] text-slate-400 font-bold flex-wrap gap-y-1">
                        <span>Điểm cũ: {s.currentLetter}</span>
                        <ArrowRight className="w-2.5 h-2.5 mx-2 text-slate-300" />
                        <span className="text-brand-600">Mục tiêu:</span>
                        <div className="relative ml-2">
                          <button
                            onClick={(e) => {
                              const menu = e.currentTarget.nextElementSibling;
                              if (menu) menu.classList.toggle('hidden');
                            }}
                            className={`
                              text-[10px] md:text-xs font-black px-2.5 py-1 rounded-lg transition-all border shadow-sm flex items-center gap-1.5
                              ${(() => {
                                if (target === 'A') return 'bg-emerald-600 border-emerald-600 text-white';
                                if (target.startsWith('B')) return 'bg-blue-600 border-blue-600 text-white';
                                if (target.startsWith('C')) return 'bg-amber-500 border-amber-500 text-white';
                                return 'bg-orange-600 border-orange-600 text-white';
                              })()}
                            `}
                          >
                            {target}
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>

                          <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 hidden min-w-[120px] animate-in fade-in zoom-in duration-150">
                            <div className="grid grid-cols-2 gap-1.5">
                              {GRADE_LETTERS.filter(l => (GRADE_SCALE[l]?.sys4 || 0) > oldSys4).map(l => {
                                const isActive = target === l;
                                let color = 'text-slate-600 hover:bg-slate-50';
                                if (l === 'A') color = isActive ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50';
                                else if (l.startsWith('B')) color = isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50';
                                else if (l.startsWith('C')) color = isActive ? 'bg-amber-500 text-white' : 'text-amber-500 hover:bg-amber-50';

                                return (
                                  <button
                                    key={l}
                                    onClick={() => {
                                      updateTarget(id, l);
                                      // Hide menu
                                      const menu = document.activeElement?.parentElement?.parentElement;
                                      if (menu) menu.classList.add('hidden');
                                    }}
                                    className={`text-[10px] font-black p-2 rounded-lg transition-all border ${isActive ? 'border-transparent shadow-md' : 'border-slate-100'} ${color}`}
                                  >
                                    {l}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase mb-1">+{itemBoost.toFixed(3)}</div>
                      <button 
                        onClick={() => removeSimulation(id)}
                        className="p-1.5 md:p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
