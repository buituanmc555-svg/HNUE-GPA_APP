import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SUBJECT_PRESETS, SEMESTER_LABELS, type SubjectPreset } from '../lib/subjectPresets';
import { BookOpen, X, Search, Pin, PlusCircle, CheckCircle2 } from 'lucide-react';

interface SubjectPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (preset: SubjectPreset) => void;
  addedSubjectCodes?: string[];
}

export const SubjectPickerModal: React.FC<SubjectPickerModalProps> = ({ open, onClose, onSelect, addedSubjectCodes = [] }) => {
  const [query, setQuery] = useState('');
  const [semFilter, setSemFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSemFilter('all');
    }
  }, [open]);

  if (!open) return null;

  const filtered = SUBJECT_PRESETS.filter(s => {
    const matchQuery = query === '' ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase());
    const matchSem = semFilter === 'all' || s.semester === semFilter || (!s.semester && semFilter === 'other');
    return matchQuery && matchSem;
  });

  const grouped: Record<string, SubjectPreset[]> = {};
  filtered.forEach(s => {
    const key = s.semester || 'other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const semOrders = ['HK1','HK2','HK3','HK4','HK5','HK6','HK7','HK8','other'];

  const handleAddCustom = () => {
    onSelect({
      code: `CUSTOM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: query || 'Môn học mới',
      credits: 3,
      semester: semFilter === 'all' || semFilter === 'other' ? undefined : semFilter
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={onClose} style={{ height: '100dvh' }}>
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Thêm môn học</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 shrink-0 bg-white space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
            <input
              ref={inputRef}
              className="w-full pl-10 pr-10 py-3 bg-brand-50/30 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all font-medium text-sm text-slate-800"
              placeholder="Tìm tên hoặc mã môn (VD: ENGL237)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600" onClick={() => setQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Scrollable Filters */}
          <div className="flex overflow-x-auto pb-1 gap-2 hide-scrollbar">
            <button 
              className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${semFilter === 'all' ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20' : 'bg-brand-50 text-brand-600 border-brand-100 hover:bg-brand-100'}`} 
              onClick={() => setSemFilter('all')}
            >
              Tất cả
            </button>
            {Object.entries(SEMESTER_LABELS).map(([k, v]) => (
              <button 
                key={k} 
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${semFilter === k ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20' : 'bg-brand-50 text-brand-600 border-brand-100 hover:bg-brand-100'}`} 
                onClick={() => setSemFilter(k)}
              >
                {v}
              </button>
            ))}
            <button 
              className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${semFilter === 'other' ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20' : 'bg-brand-50 text-brand-600 border-brand-100 hover:bg-brand-100'}`} 
              onClick={() => setSemFilter('other')}
            >
              Tự chọn
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-brand-50/20">
          {semOrders.map(sem => {
            const items = grouped[sem];
            if (!items || items.length === 0) return null;
            return (
              <div key={sem} className="mb-6 last:mb-2">
                <div className="flex items-center gap-2 mb-3 px-1">
                  {sem === 'other' ? <Pin size={16} className="text-brand-400" /> : <BookOpen size={16} className="text-brand-600" />}
                  <h4 className="text-xs font-black text-brand-600 uppercase tracking-widest">
                    {sem === 'other' ? 'Tự chọn / Chưa phân HK' : SEMESTER_LABELS[sem]}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map(preset => {
                    const isAdded = addedSubjectCodes.includes(preset.code);
                    return (
                      <div
                        key={preset.code}
                        className={`flex flex-col justify-center p-3 rounded-xl border transition-all ${isAdded ? 'bg-emerald-50/50 border-emerald-200/50 opacity-60' : 'bg-white border-slate-200 hover:border-brand-400 hover:shadow-md cursor-pointer group'}`}
                        onClick={() => {
                          if (!isAdded) onSelect(preset);
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold ${isAdded ? 'text-emerald-500' : 'text-slate-400 group-hover:text-brand-500'}`}>{preset.code}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-600'}`}>{preset.credits} TC</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <h5 className={`font-bold text-sm leading-tight ${isAdded ? 'text-emerald-700' : 'text-slate-700 group-hover:text-brand-700'}`}>{preset.name}</h5>
                          {isAdded ? (
                            <CheckCircle2 size={16} className="text-emerald-500 ml-2 shrink-0" />
                          ) : (
                            <PlusCircle size={16} className="text-slate-300 group-hover:text-brand-500 ml-2 shrink-0 transition-colors" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 font-medium mb-4">Không tìm thấy môn "{query}"</p>
              <button 
                onClick={handleAddCustom}
                className="inline-flex items-center px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-sm"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Tạo môn học trống
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0 rounded-b-2xl">
          <span className="text-xs font-medium text-slate-500">Click vào môn để thêm. Có thể thêm nhiều môn.</span>
          <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm" onClick={onClose}>
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
