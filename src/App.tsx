import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Workspace } from './components/Workspace';
import { GraduateProgress } from './components/GraduateProgress';
import { useSubjects } from './hooks/useSubjects';
import { SessionsPanel } from './components/SessionsPanel';
import { ImportModal } from './components/ImportModal';
import { getSessions, clearAllData } from './lib/storage';
import { supabase } from './supabaseClient';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'workspace' | 'progress'>('workspace');
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState(getSessions());

  const { 
    subjects, 
    addSubject, 
    updateSubject, 
    removeSubject, 
    loadSubjects, 
    clearAll,
    semesterLabels,
    updateSemesterLabel,
    isLoading
  } = useSubjects(session?.user?.id);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAllData();
    clearAll();
  };

  // Close sidebar on tab change (mobile)
  const handleTabChange = (tab: 'workspace' | 'progress') => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  // Handle Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update sessions whenever modals close or actions happen
  useEffect(() => {
    if (!isSessionsOpen) {
      setSessions(getSessions());
    }
  }, [isSessionsOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).lucide) (window as any).lucide.createIcons();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!session) {
    return <AuthScreen />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-mono">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-800 font-mono h-screen w-screen overflow-hidden flex relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        subjects={subjects} 
        onSignOut={handleSignOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 relative">
        <TopBar 
          title={activeTab === 'workspace' ? 'Không gian làm việc' : 'Tiến độ học tập'}
          onExport={() => setIsSessionsOpen(true)}
          onImport={() => setIsImportOpen(true)}
          onManageProfiles={() => setIsSessionsOpen(true)}
          currentProfileName={"Kịch bản hiện tại"}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          {activeTab === 'workspace' ? (
            <Workspace 
              subjects={subjects}
              onUpdateSubject={updateSubject}
              onRemoveSubject={removeSubject}
              onAddSubject={addSubject}
              semesterLabels={semesterLabels}
              onUpdateSemesterLabel={updateSemesterLabel}
            />
          ) : (
            <GraduateProgress 
              subjects={subjects} 
              semesterLabels={semesterLabels}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {isSessionsOpen && (
        <SessionsPanel 
          onClose={() => setIsSessionsOpen(false)}
          currentSubjects={subjects}
          onLoadSession={loadSubjects}
        />
      )}
      
      {isImportOpen && (
        <ImportModal
          onClose={() => setIsImportOpen(false)}
          onImport={loadSubjects}
        />
      )}
    </div>
  );
}
