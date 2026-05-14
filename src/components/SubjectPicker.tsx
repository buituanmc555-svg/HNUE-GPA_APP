import React, { useState, useRef, useEffect } from 'react';
import { SUBJECT_PRESETS, SEMESTER_LABELS, type SubjectPreset } from '../lib/subjectPresets';

interface SubjectPickerProps {
  onSelect: (preset: SubjectPreset) => void;
}

export const SubjectPicker: React.FC<SubjectPickerProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [semFilter, setSemFilter] = useState<string>('all');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  return (
    <div className="subject-picker" ref={ref}>
      <div className="picker-trigger" onClick={() => setOpen(true)}>
        <input
          className="picker-input"
          placeholder="🔍 Tìm nhanh môn học HNUE (tên hoặc mã môn)..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <span className="picker-count">{SUBJECT_PRESETS.length} môn</span>
      </div>

      {open && (
        <div className="picker-dropdown">
          {/* Semester filter chips */}
          <div className="picker-filters">
            <button className={`filter-chip ${semFilter === 'all' ? 'active' : ''}`} onClick={() => setSemFilter('all')}>Tất cả</button>
            {Object.entries(SEMESTER_LABELS).map(([k, v]) => (
              <button key={k} className={`filter-chip ${semFilter === k ? 'active' : ''}`} onClick={() => setSemFilter(k)}>
                {v}
              </button>
            ))}
            <button className={`filter-chip ${semFilter === 'other' ? 'active' : ''}`} onClick={() => setSemFilter('other')}>Tự chọn</button>
          </div>

          <div className="picker-list">
            {semOrders.map(sem => {
              const items = grouped[sem];
              if (!items || items.length === 0) return null;
              return (
                <div key={sem}>
                  <div className="picker-group-label">
                    {sem === 'other' ? '📌 Chưa phân học kỳ / Tự chọn' : `📚 ${SEMESTER_LABELS[sem]}`}
                  </div>
                  {items.map(preset => (
                    <div
                      key={preset.code}
                      className="picker-item"
                      onClick={() => {
                        onSelect(preset);
                        setQuery('');
                        setOpen(false);
                      }}
                    >
                      <span className="picker-code">{preset.code}</span>
                      <span className="picker-name">{preset.name}</span>
                      <span className="picker-credits">{preset.credits} TC</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="picker-empty">Không tìm thấy môn "{query}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
