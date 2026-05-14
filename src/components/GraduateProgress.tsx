import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Subject } from '../types';
import { calcGPA, isNonGPASubject } from '../lib/calculator';
import { TrendingUp, Award, BookOpen, AlertTriangle } from 'lucide-react';

interface GraduateProgressProps {
  subjects: Subject[];
  semesterLabels: Record<string, string>;
}

export const GraduateProgress: React.FC<GraduateProgressProps> = ({ subjects, semesterLabels }) => {
  const TOTAL_CREDITS_REQUIRED = 135;
  
  const achievedCredits = useMemo(() => {
    return subjects.filter(s => s.scoreFinal !== undefined && s.scoreFinal >= 4.0 && !isNonGPASubject(s)).reduce((sum, s) => sum + s.credits, 0);
  }, [subjects]);

  const studyingCredits = useMemo(() => {
    return subjects.filter(s => s.scoreFinal === undefined && !isNonGPASubject(s)).reduce((sum, s) => sum + s.credits, 0);
  }, [subjects]);

  const currentGPA = useMemo(() => {
    const completed = subjects.filter(s => s.scoreFinal !== undefined);
    return calcGPA(completed);
  }, [subjects]);

  const unassignedSubjects = useMemo(() => {
    return subjects.filter(s => !s.semesterId || s.semesterId === 'other');
  }, [subjects]);

  const chartData = useMemo(() => {
    const semOrders = ['HK1','HK2','HK3','HK4','HK5','HK6','HK7','HK8'];
    const activeSems = Array.from(new Set(subjects.map(s => s.semesterId).filter(s => s && s !== 'other'))) as string[];
    
    const allRelevantSems = Array.from(new Set([...semOrders, ...activeSems]));

    allRelevantSems.sort((a, b) => {
      const aIsHK = a.startsWith('HK') && !isNaN(parseInt(a.replace('HK', '')));
      const bIsHK = b.startsWith('HK') && !isNaN(parseInt(b.replace('HK', '')));
      if (aIsHK && bIsHK) return parseInt(a.replace('HK', '')) - parseInt(b.replace('HK', ''));
      if (aIsHK) return -1;
      if (bIsHK) return 1;
      return a.localeCompare(b);
    });

    const data = [{ name: 'Khởi điểm', gpa: 0 }];
    let accumulatedSubjects: Subject[] = [];
    let lastGPA = 0;

    // Find the last semester that actually has a grade to stop the chart there
    let lastSemIdxWithGrades = -1;
    allRelevantSems.forEach((sem, idx) => {
      if (subjects.some(s => s.semesterId === sem && s.scoreFinal !== undefined)) {
        lastSemIdxWithGrades = idx;
      }
    });

    // Only iterate up to the last semester with grades
    const semestersToShow = allRelevantSems.slice(0, lastSemIdxWithGrades + 1);

    semestersToShow.forEach(sem => {
      const semSubjects = subjects.filter(s => s.semesterId === sem);
      accumulatedSubjects = [...accumulatedSubjects, ...semSubjects];
      const completedSoFar = accumulatedSubjects.filter(s => s.scoreFinal !== undefined);
      
      const label = semesterLabels[sem] || sem;
      
      if (completedSoFar.length > 0) {
        lastGPA = Number(calcGPA(completedSoFar).toFixed(2));
        data.push({ name: label, gpa: lastGPA });
      } else {
        // For baseline semesters that might be empty but are before the first grade
        data.push({ name: label, gpa: lastGPA });
      }
    });

    // If no semesters mapped, just show basic progress
    if (data.length === 1 && currentGPA > 0) {
      data.push({ name: 'Hiện tại', gpa: Number(currentGPA.toFixed(2)) });
    }

    return data;
  }, [subjects, currentGPA, semesterLabels]);

  const progressPercent = Math.min(100, Math.round((achievedCredits / TOTAL_CREDITS_REQUIRED) * 100));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xl shadow-slate-200/40 flex flex-col hover:border-brand-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 font-black mb-1 text-[10px] md:text-sm tracking-widest uppercase">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-brand-500" /> Tiến độ Tín chỉ
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-800 mt-2">
            {achievedCredits} <span className="text-xs md:text-sm font-bold text-slate-400">/ {TOTAL_CREDITS_REQUIRED} TC</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 md:h-2.5 mt-4">
            <div className="bg-brand-500 h-2 md:h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-2">Đã hoàn thành {progressPercent}% chương trình</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xl shadow-slate-200/40 flex flex-col hover:border-emerald-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 font-black mb-1 text-[10px] md:text-sm tracking-widest uppercase">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /> Đang học
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-800 mt-2">
            {studyingCredits} <span className="text-xs md:text-sm font-bold text-slate-400">TC</span>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-auto pt-2">Số tín chỉ tích luỹ kỳ này</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xl shadow-slate-200/40 flex flex-col hover:border-orange-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 font-black mb-1 text-[10px] md:text-sm tracking-widest uppercase">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-orange-500" /> GPA Tích luỹ
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-800 mt-2">
            {currentGPA.toFixed(2)}
          </div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-auto pt-2">Dựa trên các môn đã có điểm</p>
        </div>
      </div>

      {unassignedSubjects.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start shadow-sm animate-fade-in">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600 mr-3 md:mr-4 shrink-0">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h4 className="font-bold text-orange-800 text-[11px] md:text-sm">Có {unassignedSubjects.length} môn chưa phân học kỳ</h4>
            <p className="text-[10px] md:text-xs text-orange-600 mt-1 font-medium leading-relaxed">
              Các môn này không được tính vào biểu đồ xu hướng GPA. Vui lòng quay lại Workspace để sắp xếp.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-8 shadow-xl shadow-slate-200/40">
        <h3 className="text-base md:text-lg font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-brand-600" /> Xu hướng GPA
        </h3>
        <div className="h-64 md:h-80 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis 
                domain={[0, 4]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: '#0f172a', fontWeight: '900' }}
              />
              <Line 
                type="monotone" 
                dataKey="gpa" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                name="GPA"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
