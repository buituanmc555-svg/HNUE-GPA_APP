import React, { useMemo } from 'react';
import { GraduationCap, LayoutDashboard, Target, Award, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Subject } from '../types';
import { calcGPA } from '../lib/calculator';

interface SidebarProps {
  activeTab: 'workspace' | 'progress';
  onTabChange: (tab: 'workspace' | 'progress') => void;
  subjects: Subject[];
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, subjects, onSignOut, isOpen, onClose }) => {
  const currentGPA = useMemo(() => {
    const completed = subjects.filter(s => s.scoreFinal !== undefined);
    return calcGPA(completed);
  }, [subjects]);
  
  const achievedSubjects = subjects.filter(s => s.scoreFinal !== undefined && s.scoreFinal >= 4.0);
  const achievedCredits = achievedSubjects.reduce((sum, s) => sum + s.credits, 0);

  let gpaLabel = 'YẾU';
  let labelColor = 'text-red-600 bg-red-100 border-red-200';
  if (currentGPA >= 3.6) { gpaLabel = 'XUẤT SẮC'; labelColor = 'text-brand-600 bg-brand-50 border-brand-200'; }
  else if (currentGPA >= 3.2) { gpaLabel = 'GIỎI'; labelColor = 'text-emerald-600 bg-emerald-50 border-emerald-200'; }
  else if (currentGPA >= 2.5) { gpaLabel = 'KHÁ'; labelColor = 'text-blue-600 bg-blue-50 border-blue-200'; }
  else if (currentGPA >= 2.0) { gpaLabel = 'TRUNG BÌNH'; labelColor = 'text-slate-600 bg-slate-100 border-slate-200'; }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0">
          <div className="flex items-center">
            <div className="p-2 bg-brand-600 rounded-xl mr-3 shadow-lg shadow-brand-500/20">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight tracking-tight">UniEase</h1>
              <p className="text-[10px] text-brand-400 font-bold tracking-widest uppercase">HNUE GPA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white lg:hidden"
          >
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          <button 
            onClick={() => onTabChange('workspace')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'workspace' 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white group'
            }`}
          >
            <Target className={`w-5 h-5 mr-3 ${activeTab === 'workspace' ? 'text-white' : 'text-slate-500 group-hover:text-brand-400 transition-colors'}`} />
            Giả Lập & Mục Tiêu
          </button>
          
          <button 
            onClick={() => onTabChange('progress')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'progress' 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white group'
            }`}
          >
            <Award className={`w-5 h-5 mr-3 ${activeTab === 'progress' ? 'text-white' : 'text-slate-500 group-hover:text-brand-400 transition-colors'}`} />
            Tiến độ tốt nghiệp
          </button>
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-800/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GPA Tích lũy</span>
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border shadow-sm ${labelColor} animate-pulse`}>{gpaLabel}</span>
        </div>
        
        <div className="flex items-baseline space-x-1 mb-6 relative">
          <div className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{currentGPA.toFixed(2)}</div>
          <div className="text-sm text-slate-500 font-bold mb-1">/ 4.0</div>
          
          {/* Subtle decoration */}
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-brand-500/10 rounded-full blur-2xl"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center transition-all hover:border-brand-500/50 hover:bg-slate-800">
            <div className="font-black text-white text-lg">{achievedCredits}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">Tín chỉ</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center transition-all hover:border-brand-500/50 hover:bg-slate-800">
            <div className="font-black text-white text-lg">{achievedSubjects.length}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">Môn học</div>
          </div>
        </div>

        <button 
          onClick={onSignOut}
          className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-black text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-slate-700/50 group"
        >
          <LogOut className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" />
          ĐĂNG XUẤT
        </button>
      </div>
    </aside>
  );
};
