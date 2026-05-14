import React from 'react';
import { RefreshCcw, Camera, DownloadCloud, Menu } from 'lucide-react';
import html2canvas from 'html2canvas';

interface TopBarProps {
  title: string;
  onExport: () => void;
  onImport: () => void;
  onManageProfiles: () => void;
  currentProfileName: string;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onExport, onImport, onManageProfiles, currentProfileName, onToggleSidebar }) => {
  const handleSnapshot = async () => {
    const el = document.getElementById('workspace-capture-area');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor: '#f8fafc', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `hnue-gpa-snapshot-${new Date().getTime()}.png`;
      a.click();
    } catch (e) {
      console.error('Failed to snapshot', e);
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10 sticky top-0">
      <div className="flex items-center space-x-3 md:space-x-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight truncate max-w-[150px] md:max-w-none">
          {title}
        </h2>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center bg-brand-50 p-1 rounded-xl border border-brand-100">
          <button 
            onClick={onExport}
            className="p-1.5 md:p-2 text-brand-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" 
            title="Quản lý phiên làm việc"
          >
            <RefreshCcw className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={handleSnapshot}
            className="p-1.5 md:p-2 text-brand-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" 
            title="Chụp ảnh kết quả"
          >
            <Camera className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        
        <button 
          onClick={onImport}
          className="flex items-center px-4 md:px-6 py-2 md:py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] md:text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-600/20 active:scale-95 border border-brand-500/30"
        >
          <DownloadCloud className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
          <span className="hidden xs:inline">Đồng bộ HNUE</span>
          <span className="xs:hidden">Đồng bộ</span>
        </button>
      </div>
    </header>
  );
};
