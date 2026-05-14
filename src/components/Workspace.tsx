import React, { useState } from 'react';
import { SubjectTable } from './SubjectTable';
import { DegreePlanner } from './DegreePlanner';
import { RetakeOptimizer } from './RetakeOptimizer';
import type { Subject } from '../types';
import { Info, FlaskConical, Compass, Sparkles } from 'lucide-react';

interface WorkspaceProps {
  subjects: Subject[];
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void;
  onRemoveSubject: (id: string) => void;
  onAddSubject: (data?: Partial<Subject>) => void;
  semesterLabels: Record<string, string>;
  onUpdateSemesterLabel: (id: string, label: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  subjects, 
  onUpdateSubject, 
  onRemoveSubject,
  onAddSubject,
  semesterLabels,
  onUpdateSemesterLabel
}) => {
  const [mode, setMode] = useState<'whatif' | 'target' | 'retake'>('whatif');

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6" id="workspace-capture-area">
      
      {/* TOP CONTROLS: Tab Switcher */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
        <div className="flex items-center p-1 md:p-1.5 bg-slate-200/50 rounded-2xl w-fit border border-slate-200/60 shadow-inner backdrop-blur-sm shrink-0">
          <button 
            onClick={() => setMode('whatif')}
            className={`flex items-center px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm transition-all rounded-xl whitespace-nowrap ${
              mode === 'whatif' 
                ? 'bg-brand-600 shadow-lg shadow-brand-600/30 font-black text-white scale-105' 
                : 'font-bold text-slate-500 hover:text-brand-600 hover:bg-brand-50'
            }`}
          >
            <FlaskConical className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 ${mode === 'whatif' ? 'text-white' : 'text-brand-400'}`} />
            Giả Lập Điểm
          </button>
          
          <button 
            onClick={() => setMode('target')}
            className={`flex items-center px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm transition-all rounded-xl whitespace-nowrap ${
              mode === 'target' 
                ? 'bg-brand-600 shadow-lg shadow-brand-600/30 font-black text-white scale-105' 
                : 'font-bold text-slate-500 hover:text-brand-600 hover:bg-brand-50'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 ${mode === 'target' ? 'text-white' : 'text-brand-400'}`} />
            Định vị bằng cấp
          </button>

          <button 
            onClick={() => setMode('retake')}
            className={`flex items-center px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm transition-all rounded-xl whitespace-nowrap ${
              mode === 'retake' 
                ? 'bg-brand-600 shadow-lg shadow-brand-600/30 font-black text-white scale-105' 
                : 'font-bold text-slate-500 hover:text-brand-600 hover:bg-brand-50'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 ${mode === 'retake' ? 'text-white' : 'text-amber-400'}`} />
            Tối ưu học tập
          </button>
        </div>
      </div>

      {mode === 'whatif' && (
        <div className="bg-gradient-to-r from-brand-50 to-white border border-brand-100 rounded-2xl p-4 md:p-5 flex gap-3 md:gap-4 text-brand-900 shadow-sm animate-fade-in">
          <div className="p-2 bg-brand-600 rounded-lg shrink-0 h-fit">
            <Info className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="text-[11px] md:text-sm">
            <p className="font-black mb-1">Chế độ Giả lập điểm</p>
            <p className="text-slate-600 font-medium leading-relaxed">Thay đổi điểm CC/ĐK hoặc kéo thanh mục tiêu để dự đoán GPA. Hệ thống sẽ tính toán điểm thi cần thiết.</p>
          </div>
        </div>
      )}

      {mode === 'target' && (
        <DegreePlanner subjects={subjects} />
      )}

      {mode === 'retake' && (
        <RetakeOptimizer subjects={subjects} />
      )}

      {mode === 'whatif' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <SubjectTable 
            subjects={subjects} 
            onUpdate={onUpdateSubject} 
            onRemove={onRemoveSubject} 
            onAdd={onAddSubject}
            isTargetMode={false}
            semesterLabels={semesterLabels}
            onUpdateSemesterLabel={onUpdateSemesterLabel}
          />
        </div>
      )}
    </div>
  );
};
