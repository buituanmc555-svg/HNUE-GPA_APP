import React from 'react';
import { calcRequiredFinalScore, getLetterFrom10 } from '../lib/calculator';
import type { Subject, GradeLetter } from '../types';
import { MoreHorizontal, Flame, CheckCircle2, Trash2, ChevronDown } from 'lucide-react';

interface SubjectRowProps {
  subject: Subject;
  index: number;
  onUpdate: (id: string, updates: Partial<Subject>) => void;
  onRemove: (id: string) => void;
  isTargetMode?: boolean;
}

export const SubjectRow: React.FC<SubjectRowProps> = ({ subject, index, onUpdate, onRemove, isTargetMode }) => {
  const result = calcRequiredFinalScore(subject);
  
  const isCompleted = subject.scoreFinal !== undefined;
  const isRedAlert = !isCompleted && result.score !== null && result.score > 8.5;
  const isImpossible = result.status === 'impossible';

  const achievedLetter = isCompleted 
    ? getLetterFrom10(subject.scoreCC * subject.weightCC + subject.scoreDK * subject.weightDK + (subject.scoreFinal! * subject.weightFinal))
    : null;

  const handleChange = (field: keyof Subject, value: any) => {
    if (isTargetMode) return;
    onUpdate(subject.id, { [field]: value });
  };

  const handleScoreChange = (field: 'scoreCC' | 'scoreDK' | 'scoreFinal', value: string) => {
    if (isTargetMode) return;
    if (value === '') {
      onUpdate(subject.id, { [field]: undefined });
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      onUpdate(subject.id, { [field]: num });
    }
  };

  // Determine row style
  let rowClass = "hover:bg-slate-50/80 transition-colors group relative";
  if (isCompleted) {
    rowClass = "hover:bg-slate-50 transition-colors opacity-60 group bg-slate-50 relative";
  } else if (isRedAlert || isImpossible) {
    rowClass = "bg-red-50/30 hover:bg-red-50/60 transition-colors group relative";
  }

  return (
    <tr 
      className={rowClass}
      draggable={!isTargetMode}
      onDragStart={(e) => {
        if (!isTargetMode) {
          e.dataTransfer.setData('subjectId', subject.id);
          e.currentTarget.classList.add('opacity-50');
        }
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('opacity-50');
      }}
    >
      {/* Red Alert Border Indicator */}
      {(isRedAlert || isImpossible) && !isCompleted && (
        <td className="absolute left-0 w-0.5 h-full bg-red-400"></td>
      )}

      <td className={`px-6 py-4 text-center text-xs ${isRedAlert || isImpossible ? 'text-red-400' : 'text-slate-400'}`}>
        {index + 1}
      </td>
      
      <td className="px-6 py-4">
        <div className="flex flex-col items-start justify-center h-full">
          <input
            value={subject.name}
            onChange={e => handleChange('name', e.target.value)}
            readOnly={isTargetMode}
            className="bg-transparent border-none focus:ring-0 p-0 w-full font-bold text-slate-800 focus:outline-none placeholder-slate-300"
            placeholder="Tên môn học..."
          />
          {isCompleted ? (
            <button 
              onClick={() => onUpdate(subject.id, { scoreFinal: undefined })}
              className="mt-1 flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full w-fit transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" /> Đã hoàn thành
            </button>
          ) : (
            <button 
              onClick={() => onUpdate(subject.id, { scoreFinal: result.score || 0 })}
              className="mt-1 flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 px-2 py-0.5 rounded-full w-fit transition-colors opacity-0 group-hover:opacity-100"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" /> Đánh dấu hoàn thành
            </button>
          )}
        </div>
      </td>
      
      <td className="px-4 py-4 text-center">
        <select
          value={subject.credits}
          onChange={e => handleChange('credits', parseInt(e.target.value))}
          disabled={isTargetMode}
          className="bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200 px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 appearance-none text-center cursor-pointer"
        >
          {[1, 2, 3, 4, 5, 6, 7].map(c => (
            <option key={c} value={c}>{c} TC</option>
          ))}
        </select>
      </td>
      
      <td className="px-4 py-4 text-center">
        {isCompleted ? (
          <span className="font-bold text-slate-600">{subject.scoreCC ?? '--'}</span>
        ) : (
          <input
            type="number" step="0.1"
            value={subject.scoreCC === undefined ? '' : subject.scoreCC}
            onChange={e => handleScoreChange('scoreCC', e.target.value)}
            readOnly={isTargetMode}
            placeholder="--"
            className="w-12 text-center bg-transparent border-b border-dashed border-slate-300 pb-0.5 font-bold text-slate-800 focus:border-brand-500 focus:outline-none transition-colors placeholder-slate-300"
          />
        )}
      </td>
      
      <td className="px-4 py-4 text-center">
        {isCompleted ? (
          <span className="font-bold text-slate-600">{subject.scoreDK ?? '--'}</span>
        ) : (
          <input
            type="number" step="0.1"
            value={subject.scoreDK === undefined ? '' : subject.scoreDK}
            onChange={e => handleScoreChange('scoreDK', e.target.value)}
            readOnly={isTargetMode}
            placeholder="--"
            className="w-12 text-center bg-transparent border-b border-dashed border-slate-300 pb-0.5 font-bold text-slate-800 focus:border-brand-500 focus:outline-none transition-colors placeholder-slate-300"
          />
        )}
      </td>
      
      <td className="px-4 py-4 text-center">
        {isCompleted ? (
          <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{subject.scoreFinal}</span>
        ) : (
          <input
            type="number" step="0.1"
            value={subject.scoreFinal === undefined ? '' : subject.scoreFinal}
            onChange={e => handleScoreChange('scoreFinal', e.target.value)}
            readOnly={isTargetMode}
            placeholder="--"
            className="w-12 text-center bg-transparent border-b border-dashed border-slate-300 pb-0.5 font-bold text-slate-800 focus:border-brand-500 focus:outline-none transition-colors placeholder-slate-300"
          />
        )}
      </td>
      
      {/* Target Column */}
      <td className={`px-6 py-4 text-center border-l ${isCompleted ? 'border-transparent' : 'bg-brand-50/30 border-brand-100/50'}`}>
        {!isCompleted ? (
          <div className="relative flex justify-center group/target">
            {/* Active Target Display */}
            <button
              onClick={(e) => {
                const menu = e.currentTarget.nextElementSibling;
                if (menu) menu.classList.toggle('hidden');
              }}
              className={`
                text-xs font-black px-3 py-1.5 rounded-lg transition-all border shadow-sm flex items-center gap-2
                ${(() => {
                  const g = subject.targetLetter || 'B';
                  if (g === 'A') return 'bg-emerald-600 border-emerald-600 text-white';
                  if (g.startsWith('B')) return 'bg-blue-600 border-blue-600 text-white';
                  if (g.startsWith('C')) return 'bg-amber-500 border-amber-500 text-white';
                  return 'bg-orange-600 border-orange-600 text-white';
                })()}
              `}
            >
              {subject.targetLetter || 'B'}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Dropdown Menu (Pop-over) */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 hidden min-w-[140px] animate-in fade-in zoom-in duration-150">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2 text-left">Chọn mục tiêu</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D'] as GradeLetter[]).map(g => {
                  const isActive = subject.targetLetter === g;
                  let color = 'text-slate-600 hover:bg-slate-50';
                  if (g === 'A') color = isActive ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50';
                  else if (g.startsWith('B')) color = isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50';
                  else if (g.startsWith('C')) color = isActive ? 'bg-amber-500 text-white' : 'text-amber-500 hover:bg-amber-50';
                  else if (g.startsWith('D')) color = isActive ? 'bg-orange-600 text-white' : 'text-orange-600 hover:bg-orange-50';

                  return (
                    <button
                      key={g}
                      onClick={() => {
                        handleChange('targetLetter', g);
                        // Hide menu after selection
                        const menu = document.activeElement?.parentElement?.parentElement;
                        if (menu) menu.classList.add('hidden');
                      }}
                      className={`text-[11px] font-black p-2 rounded-lg transition-all border ${isActive ? 'border-transparent shadow-md' : 'border-slate-100'} ${color}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-lg text-xs border border-brand-100 shadow-sm">
              {achievedLetter}
            </span>
          </div>
        )}
      </td>
      
      {/* Required / Result Column */}
      <td className="px-6 py-4 text-center border-r border-transparent">
        {isCompleted ? (
          <div className="w-20 mx-auto bg-brand-50 border border-brand-100 rounded-xl px-2 py-1.5 font-black text-brand-700 shadow-sm text-sm">
            {(subject.scoreCC * subject.weightCC + subject.scoreDK * subject.weightDK + (subject.scoreFinal! * subject.weightFinal)).toFixed(2)}
          </div>
        ) : isImpossible ? (
          <div className="inline-flex items-center justify-center text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-lg" title="Bất khả thi">
            <Flame className="w-3.5 h-3.5 mr-1 text-red-500" />
            <span className="font-black text-[11px]">Bất khả thi</span>
          </div>
        ) : isRedAlert ? (
          <div className="inline-flex items-center justify-center text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-lg" title="Cảnh báo: Điểm yêu cầu rất cao">
            <Flame className="w-3.5 h-3.5 mr-1 text-red-500" />
            <span className="font-black text-sm">{result.score?.toFixed(2)}</span>
          </div>
        ) : (
          <span className="font-black text-slate-900 bg-slate-100/80 px-4 py-1.5 rounded-xl text-sm">{result.score?.toFixed(2)}</span>
        )}
      </td>
      
      <td className="px-4 py-4 text-center">
        <button 
          onClick={() => onRemove(subject.id)}
          className={`opacity-0 group-hover:opacity-100 transition-all ${isTargetMode ? 'hidden' : ''} text-slate-300 hover:text-red-500 hover:scale-110 p-1 mx-auto block`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};
