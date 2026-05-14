import React from 'react';
import { GraduationCap, Sparkles, Target, Save, Trash2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'whatif' | 'savenet' | 'sessions';
  onTabChange: (tab: 'whatif' | 'savenet' | 'sessions') => void;
  onClear: () => void;
  onSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onClear, onSave }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-wrap">
          <div className="logo-icon"><GraduationCap className="text-accent" size={28} /></div>
          <div>
            <h1 className="logo-title">HNUE GPA</h1>
            <span className="logo-sub">Tính điểm thông minh</span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab ${activeTab === 'whatif' ? 'active' : ''}`}
          onClick={() => onTabChange('whatif')}
          id="tab-whatif"
        >
          <span className="tab-icon"><Sparkles size={16} /></span>
          What-if
        </button>
        <button
          className={`nav-tab ${activeTab === 'savenet' ? 'active' : ''}`}
          onClick={() => onTabChange('savenet')}
          id="tab-savenet"
        >
          <span className="tab-icon"><Target size={16} /></span>
          Cứu Net
        </button>
        <button
          className={`nav-tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => onTabChange('sessions')}
          id="tab-sessions"
        >
          <span className="tab-icon"><Save size={16} /></span>
          Kịch bản
        </button>
      </nav>

      <div className="header-right">
        <button className="btn-header btn-clear" onClick={onClear} title="Xoá tất cả">
          <Trash2 size={16} /> Xoá
        </button>
        <button className="btn-header btn-save" onClick={onSave} title="Lưu kịch bản">
          <Save size={16} /> Lưu
        </button>
      </div>
    </header>
  );
};
