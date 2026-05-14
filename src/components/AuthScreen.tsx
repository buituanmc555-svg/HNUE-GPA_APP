import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { GraduationCap, AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        alert("Đăng ký thành công! Hãy đăng nhập.");
        setMode('login');
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-mono text-slate-800 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full relative overflow-hidden animate-fade-in">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-600" />

        {/* Header */}
        <div className="text-center mb-8">
          <GraduationCap className="text-brand-600 w-12 h-12 mx-auto" />
          <h1 className="text-2xl font-black text-slate-900 mt-3 tracking-tight italic">HNUE GPA</h1>
          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">
            {mode === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email</label>
            <input 
              type="email" 
              placeholder="name@university.edu.vn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all font-bold text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-all font-bold text-sm"
              required
            />
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="text-xs font-bold leading-relaxed">{error}</span>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white font-black py-3 rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={toggleMode}
            className="text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            {mode === 'login' ? (
              <>Bạn chưa có tài khoản? <span className="text-brand-600">Đăng ký ngay</span></>
            ) : (
              <>Bạn đã có tài khoản? <span className="text-brand-600">Đăng nhập</span></>
            )}
          </button>
        </div>

        <div className="mt-8 text-center pt-6 border-t border-slate-50">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
            An toàn • Bảo mật • Thông minh
          </p>
        </div>
      </div>
    </div>
  );
};
