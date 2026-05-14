import React, { useState } from 'react';
import { X, FolderOpen, Save, Trash2, Folder, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import type { SavedSession, Subject } from '../types';
import { getSessions, deleteSession, saveSession, generateId } from '../lib/storage';

interface SessionsPanelProps {
  onClose: () => void;
  currentSubjects: Subject[];
  onLoadSession: (subjects: Subject[]) => void;
}

export const SessionsPanel: React.FC<SessionsPanelProps> = ({ onClose, currentSubjects, onLoadSession }) => {
  const [sessions, setSessions] = useState<SavedSession[]>(() => getSessions());
  const [newSessionName, setNewSessionName] = useState('');

  const handleSave = () => {
    if (!newSessionName.trim()) return;
    const newSession: SavedSession = {
      id: generateId(),
      name: newSessionName.trim(),
      subjects: currentSubjects,
      createdAt: new Date().toISOString(),
    };
    saveSession(newSession);
    setSessions(getSessions());
    setNewSessionName('');
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  const handleLoad = (session: SavedSession) => {
    onLoadSession(session.subjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <Folder className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Quản lý kịch bản</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Save Card */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Lưu kịch bản hiện tại</p>
              <input
                type="text"
                placeholder="Tên kịch bản (VD: Kịch bản an toàn B+)"
                className="w-full bg-white border border-brand-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!newSessionName.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu ngay
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
              Danh sách kịch bản ({sessions.length})
            </h4>

            {sessions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Bạn chưa lưu kịch bản nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {sessions.map(session => (
                  <div key={session.id} className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition-all flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => handleLoad(session)}>
                      <h5 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">{session.name}</h5>
                      <div className="flex items-center space-x-3 mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                        <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {session.subjects.length} môn</span>
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(session.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleLoad(session)}
                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Tải kịch bản này"
                      >
                        <FolderOpen className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(session.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá kịch bản"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center shrink-0">
          <p className="text-[10px] text-slate-400 font-medium">Kịch bản được lưu cục bộ trên trình duyệt của bạn.</p>
        </div>
      </div>
    </div>
  );
};
