import React, { useState } from 'react';
import { X, Upload, Clipboard, CheckCircle2, AlertCircle, Key, Loader2, GraduationCap } from 'lucide-react';
import type { Subject } from '../types';
import { hnueService } from '../lib/hnueApi';

interface ImportModalProps {
  onClose: () => void;
  onImport: (subjects: Subject[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<'json' | 'hnue'>('json');
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const data = JSON.parse(input);
      if (!Array.isArray(data)) throw new Error('Dữ liệu không hợp lệ (phải là mảng)');
      
      const validSubjects = data.filter((s: any) => s.name && typeof s.credits === 'number');
      if (validSubjects.length === 0) throw new Error('Không tìm thấy môn học hợp lệ');

      onImport(validSubjects);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi xử lý dữ liệu');
    }
  };

  const handleHNUESync = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Login to get JWT using Service
      const loginData = await hnueService.login(username, password);
      const token = loginData.Token || loginData.access_token || loginData.token;

      if (!token) throw new Error('Không lấy được mã xác thực từ HNUE.');

      // 2. Fetch Marks
      const k = username.substring(0, 2);
      const major = username.substring(3, 6);
      const ctdt = `DHCQK${k}${major}`;

      // 2. Fetch Marks using Service
      const marksData = await hnueService.getMarks(token, username);

      // 3. Map Data
      const allSubjects: Subject[] = [];
      
      // Iterate through ALL years
      for (const yearData of marksData) {
        const semesters = yearData.DanhSachDiem || [];
        
        for (const sem of semesters) {
          const semId = sem.HocKy || `sem-${Date.now()}`;
          let mappedSemId = semId;
          if (mappedSemId.startsWith('HK0')) {
            mappedSemId = mappedSemId.replace('HK0', 'HK');
          }

          const subjects = sem.DanhSachDiemHK || [];
          
          // Fetch details using Service
          const detailPromises = subjects.map((s: any) => 
            s.ScheduleStudyUnitID ? hnueService.getMarkDetail(token, s.ScheduleStudyUnitID) : Promise.resolve(null)
          );
          const allDetails = await Promise.all(detailPromises);

          subjects.forEach((s: any, index: number) => {
            const name = s.CurriculumName || 'Môn học không tên';
            const nameLower = name.toLowerCase();
            
            const isExcluded = 
              nameLower.includes('thể chất') || 
              nameLower.includes('quốc phòng') || 
              nameLower.includes('quân sự') || 
              nameLower.includes('pháp luật') || 
              nameLower.includes('ngoài chương trình') ||
              name.includes('*') || 
              /^hp[1-4][: ]/i.test(name);

            if (isExcluded) return;

            const details = allDetails[index];
            let scoreCC = 10, scoreDK = 8;
            let scoreFinal = s.DiemTK_10 ? Number(s.DiemTK_10) : undefined;
            let weightCC = 0.1, weightDK = 0.3, weightFinal = 0.6;

            if (details && Array.isArray(details)) {
              details.forEach((d: any) => {
                const weight = d.Assignmentdetail ? parseFloat(d.Assignmentdetail) / 100 : 0;
                const mark = d.FirstMark ? Number(d.FirstMark) : undefined;
                
                if (d.Abbreviation === 'CC') {
                  if (mark !== undefined) scoreCC = mark;
                  weightCC = weight;
                } else if (d.Abbreviation === 'KT1' || d.Abbreviation === 'DK') {
                  if (mark !== undefined) scoreDK = mark;
                  weightDK = weight;
                } else if (d.Abbreviation === 'DiemLT' || d.AssignmentName?.toLowerCase().includes('thi')) {
                  if (mark !== undefined) scoreFinal = mark;
                  weightFinal = weight;
                }
              });
            } else if (scoreFinal !== undefined) {
              // Fallback if no details: set all to final to maintain average
              scoreCC = scoreFinal;
              scoreDK = scoreFinal;
            }

            allSubjects.push({
              id: s.CurriculumID || Math.random().toString(36).substr(2, 9),
              name: name,
              credits: Number(s.Credits || 0),
              weightCC,
              weightDK,
              weightFinal,
              scoreCC,
              scoreDK,
              scoreFinal,
              targetLetter: s.DiemTK_Chu || 'B+',
              semesterId: mappedSemId
            });
          });
        }
      }

      if (allSubjects.length === 0) throw new Error('Không tìm thấy dữ liệu điểm nào.');

      onImport(allSubjects);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối tới HNUE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={onClose} style={{ height: '100dvh' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-500/20">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800 tracking-tight">Đồng bộ dữ liệu</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Nhập điểm từ cổng đào tạo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-1.5 bg-slate-100/50 mx-8 mt-6 rounded-2xl flex border border-slate-200/60">
          <button 
            onClick={() => setActiveTab('json')}
            className={`flex-1 flex items-center justify-center py-2.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'json' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5 mr-2" />
            DÁN JSON / FILE
          </button>
          <button 
            onClick={() => setActiveTab('hnue')}
            className={`flex-1 flex items-center justify-center py-2.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'hnue' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 mr-2" />
            ĐĂNG NHẬP HNUE
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'json' ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <textarea
                  className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-mono text-xs text-slate-600 shadow-inner"
                  placeholder='[{"name": "Toán cao cấp", "credits": 3, ...}]'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer group">
                    <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                    <span className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center transition-colors">
                      <Upload className="w-4 h-4 mr-1.5" />
                      Tải lên file .json
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hỗ trợ JSON từ Extension UniEase</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex gap-4 text-brand-900">
                <Key className="w-5 h-5 text-brand-600 shrink-0" />
                <p className="text-[11px] font-bold leading-relaxed">
                  Dữ liệu điểm sẽ được tải trực tiếp từ <span className="font-black">uisapi.hnue.edu.vn</span>. Tài khoản của bạn được bảo mật và chỉ dùng để lấy mã xác thực JWT.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã sinh viên</label>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: 725701001"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu portal</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 text-xs animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest">
            Hủy bỏ
          </button>
          
          {activeTab === 'json' ? (
            <button
              onClick={handleImport}
              disabled={!input.trim()}
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:bg-slate-400 text-white text-sm font-black rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center uppercase tracking-widest"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Xác nhận
            </button>
          ) : (
            <button
              onClick={handleHNUESync}
              disabled={isLoading || !username || !password}
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:bg-slate-400 text-white text-sm font-black rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center uppercase tracking-widest"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang đồng bộ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Đồng bộ ngay
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
