import React, { useState, useMemo } from 'react';
import type { Subject } from '../types';
import { SubjectRow } from './SubjectRow';
import { Plus, Info, LayoutTemplate, Layers, PlusCircle, Edit2 } from 'lucide-react';
import { SubjectPickerModal } from './SubjectPickerModal';

interface SubjectTableProps {
  subjects: Subject[];
  onUpdate: (id: string, updates: Partial<Subject>) => void;
  onRemove: (id: string) => void;
  onAdd: (data?: Partial<Subject>) => void;
  isTargetMode?: boolean;
  semesterLabels: Record<string, string>;
  onUpdateSemesterLabel: (id: string, label: string) => void;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({ 
  subjects, 
  onUpdate, 
  onRemove, 
  onAdd,
  isTargetMode,
  semesterLabels,
  onUpdateSemesterLabel
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetSemesterForAdd, setTargetSemesterForAdd] = useState<string | undefined>(undefined);
  
  // Track visible semesters so empty ones don't disappear immediately during drag/drop
  const [customSemesters, setCustomSemesters] = useState<string[]>([]);

  const groupedSubjects = useMemo(() => {
    const groups: Record<string, Subject[]> = {};
    // Ensure all fixed semesters have a group
    ['HK1', 'HK2', 'HK3', 'HK4', 'HK5', 'HK6', 'HK7', 'HK8', 'other', ...customSemesters].forEach(sem => groups[sem] = []);
    subjects.forEach(s => {
      const sem = s.semesterId || 'other';
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(s);
    });
    return groups;
  }, [subjects, customSemesters]);

  const finalSemesters = useMemo(() => {
    const fixed = ['HK1', 'HK2', 'HK3', 'HK4', 'HK5', 'HK6', 'HK7', 'HK8'];
    
    // 1. Find the highest HK index that has subjects
    let maxHKIndex = -1; // -1 means no HK subjects yet
    subjects.forEach(s => {
      if (s.semesterId && s.semesterId.startsWith('HK')) {
        const num = parseInt(s.semesterId.replace('HK', ''));
        if (!isNaN(num)) {
          const idx = fixed.indexOf(`HK${num}`);
          if (idx > maxHKIndex) maxHKIndex = idx;
        }
      }
    });

    // 2. Determine visible fixed semesters: all with subjects + 1 next semester
    // If no subjects, show at least HK1
    const limitIdx = Math.min(fixed.length - 1, maxHKIndex + 1);
    const visibleFixed = fixed.slice(0, Math.max(1, limitIdx + 1));
    
    const sems = new Set<string>(visibleFixed);
    
    // 3. Add any other semesters (custom or 'other') ONLY if they have subjects
    subjects.forEach(s => {
      if (s.semesterId) sems.add(s.semesterId);
    });
    
    // Always keep custom semesters that were manually added
    customSemesters.forEach(s => sems.add(s));
    
    const sorted = Array.from(sems).sort((a, b) => {
      const aIsHK = a.startsWith('HK') && !isNaN(parseInt(a.replace('HK', '')));
      const bIsHK = b.startsWith('HK') && !isNaN(parseInt(b.replace('HK', '')));
      if (aIsHK && bIsHK) return parseInt(a.replace('HK', '')) - parseInt(b.replace('HK', ''));
      if (aIsHK) return -1;
      if (bIsHK) return 1;
      return a.localeCompare(b);
    });

    // Only show 'other' if it has content
    if (groupedSubjects['other'] && groupedSubjects['other'].length > 0) {
      if (!sorted.includes('other')) sorted.push('other');
    }
    
    return sorted;
  }, [subjects, customSemesters, groupedSubjects]);

  const handleEditLabel = (id: string) => {
    const current = semesterLabels[id] || id;
    const next = prompt(`Sửa tên hiển thị cho học kỳ này:`, current);
    if (next && next.trim()) {
      onUpdateSemesterLabel(id, next.trim());
    }
  };

  const handleAddCustomSemester = () => {
    const id = prompt('Nhập mã học kỳ mới (VD: HK9, KY_HE):');
    if (id && id.trim()) {
      const newId = id.trim();
      setCustomSemesters(prev => [...prev, newId]);
      const label = prompt('Nhập tên hiển thị cho học kỳ này:', newId);
      if (label && label.trim()) {
        onUpdateSemesterLabel(newId, label.trim());
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.currentTarget.classList.add('bg-brand-50/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-brand-50/50');
  };

  const handleDrop = (e: React.DragEvent, semesterId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-brand-50/50');
    const subjectId = e.dataTransfer.getData('subjectId');
    if (subjectId) {
      onUpdate(subjectId, { semesterId: semesterId === 'other' ? undefined : semesterId });
    }
  };

  const handleAddSubject = (preset: any) => {
    onAdd({
      name: preset.name,
      credits: preset.credits,
      semesterId: targetSemesterForAdd || preset.semester,
      scoreCC: 10,
      scoreDK: 0,
      scoreFinal: undefined,
      weightCC: 0.1,
      weightDK: 0.3,
      weightFinal: 0.6,
      targetLetter: 'B+'
    });
  };

  if (subjects.length === 0 && !isTargetMode) {
    return (
      <div className="bg-brand-50 border border-dashed border-brand-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-inner">
        <div className="w-20 h-20 bg-white text-brand-600 rounded-full flex items-center justify-center mb-4 shadow-md">
          <Layers className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Chưa có môn học nào</h3>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
          Bắt đầu bằng cách thêm các môn học vào không gian làm việc. Bạn có thể chọn từ danh sách có sẵn hoặc tự tạo môn mới.
        </p>
        <button 
          onClick={() => { setTargetSemesterForAdd(undefined); setIsPickerOpen(true); }}
          className="flex items-center px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl shadow-xl shadow-brand-600/40 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6 mr-3" />
          Thêm Môn Học Đầu Tiên
        </button>
        <SubjectPickerModal 
          open={isPickerOpen} 
          onClose={() => setIsPickerOpen(false)} 
          onSelect={handleAddSubject}
          addedSubjectCodes={subjects.map(s => s.name)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {finalSemesters.map((semId) => {
        const semSubjects = groupedSubjects[semId] || [];
        const semLabel = semesterLabels[semId] || (semId === 'other' ? 'Chưa phân bổ' : semId);
        const semCredits = semSubjects.reduce((acc, s) => acc + s.credits, 0);

        return (
          <div key={semId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/40 animate-slide-up">
            {/* Group Header */}
            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between group/header">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div className="flex items-center">
                  <h3 className="font-black text-slate-800 tracking-tight mr-2">{semLabel}</h3>
                  {!isTargetMode && semId !== 'other' && (
                    <button 
                      onClick={() => handleEditLabel(semId)}
                      className="p-1 text-slate-300 hover:text-brand-500 opacity-0 group-hover/header:opacity-100 transition-all"
                      title="Sửa tên hiển thị"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">{semCredits} TC</span>
              </div>
              {!isTargetMode && (
                <button 
                  onClick={() => { setTargetSemesterForAdd(semId === 'other' ? undefined : semId); setIsPickerOpen(true); }}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Thêm môn
                </button>
              )}
            </div>

            {/* Table Drop Zone */}
            <div 
              className="overflow-x-auto no-scrollbar transition-colors duration-200 min-h-[100px] relative"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, semId)}
            >
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-[11px] text-slate-400 uppercase tracking-widest font-black border-b border-slate-100">
                  <tr>
                    <th className="px-4 md:px-6 py-4 w-12 text-center">#</th>
                    <th className="px-4 md:px-6 py-4">Tên môn học</th>
                    <th className="px-4 py-4 text-center">Tín chỉ</th>
                    <th className="px-4 py-4 text-center">CC <span className="text-[10px] font-bold lowercase text-brand-400 ml-0.5 hidden md:inline">(10%)</span></th>
                    <th className="px-4 py-4 text-center">ĐK <span className="text-[10px] font-bold lowercase text-brand-400 ml-0.5 hidden md:inline">(30%)</span></th>
                    <th className="px-4 py-4 text-center">CK <span className="text-[10px] font-bold lowercase text-brand-400 ml-0.5 hidden md:inline">(60%)</span></th>
                    <th className="px-6 py-4 text-center bg-brand-50/20 text-brand-600">
                      {semSubjects.length > 0 && semSubjects.every(s => s.scoreFinal !== undefined) ? 'Điểm chữ' : 'Mục tiêu'}
                    </th>
                    <th className="px-6 py-4 text-center bg-brand-50/10 text-brand-700">
                      {semSubjects.length > 0 && semSubjects.every(s => s.scoreFinal !== undefined) ? 'Điểm số' : 'Cần thi'}
                    </th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {semSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <p className="font-bold text-sm">Nhóm này đang trống</p>
                          <p className="text-xs">Kéo thả môn học vào đây hoặc bấm "Thêm môn"</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    semSubjects.map((subject, idx) => (
                      <SubjectRow
                        key={subject.id}
                        subject={subject}
                        index={idx}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                        isTargetMode={isTargetMode}
                      />
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Mobile Scroll Hint Overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none md:hidden" />
            </div>
          </div>
        );
      })}

      {/* Global Actions */}
      {!isTargetMode && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
          <button 
            onClick={handleAddCustomSemester}
            className="w-full md:w-auto flex items-center justify-center text-sm font-black text-slate-600 hover:text-brand-600 bg-white hover:bg-brand-50 px-5 py-3 md:py-2.5 rounded-xl transition-all border border-slate-200 hover:border-brand-200 shadow-sm"
          >
            <Layers className="w-4 h-4 mr-2" />
            Tạo Học Kỳ Mới
          </button>
          
          <div className="w-full md:w-auto text-[10px] md:text-xs text-slate-400 font-bold flex items-center justify-center bg-slate-50 px-4 py-3 md:py-2 rounded-lg border border-slate-100 shadow-inner">
            <Info className="w-4 h-4 mr-2 text-brand-500 shrink-0" />
            <span className="text-center md:text-left">Kéo thả các hàng để chuyển môn học giữa các học kỳ</span>
          </div>
        </div>
      )}

      <SubjectPickerModal 
        open={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={handleAddSubject}
        addedSubjectCodes={subjects.map(s => s.name)} 
      />
    </div>
  );
};
