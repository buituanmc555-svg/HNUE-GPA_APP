import { useState, useEffect, useCallback, useRef } from 'react';
import type { Subject } from '../types';
import { generateId, getActiveSubjects, saveActiveSubjects } from '../lib/storage';
import { DEFAULT_WEIGHTS } from '../lib/gradeScale';
import { SEMESTER_LABELS as PRESET_LABELS } from '../lib/subjectPresets';
import { supabase } from '../supabaseClient';

const DEFAULT_SUBJECT = (): Subject => ({
  id: generateId(),
  name: '',
  credits: 3,
  weightCC: DEFAULT_WEIGHTS.weightCC,
  weightDK: DEFAULT_WEIGHTS.weightDK,
  weightFinal: DEFAULT_WEIGHTS.weightFinal,
  scoreCC: 10,
  scoreDK: 0,
  targetLetter: 'B+',
  scoreFinal: undefined,
});

export function useSubjects(userId?: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterLabels, setSemesterLabels] = useState<Record<string, string>>(PRESET_LABELS);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);

  // 1. Fetch initial data (from Supabase if userId, else localStorage)
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      if (userId) {
        const { data, error } = await supabase
          .from('user_data')
          .select('subjects, semester_labels')
          .eq('user_id', userId)
          .single();

        if (data && !error) {
          setSubjects(data.subjects || [DEFAULT_SUBJECT()]);
          setSemesterLabels(data.semester_labels || PRESET_LABELS);
        } else {
          // If no remote data, try local or default
          const saved = getActiveSubjects();
          setSubjects(saved.length > 0 ? saved : [DEFAULT_SUBJECT()]);
        }
      } else {
        const saved = getActiveSubjects();
        setSubjects(saved.length > 0 ? saved : [DEFAULT_SUBJECT()]);
        const savedLabels = localStorage.getItem('hnue_gpa_semester_labels');
        if (savedLabels) setSemesterLabels(JSON.parse(savedLabels));
      }
      
      setIsLoading(false);
      isInitialMount.current = false;
    };

    loadInitialData();
  }, [userId]);

  // 2. Sync to Supabase (Debounced)
  useEffect(() => {
    if (isLoading || !userId || isInitialMount.current) return;

    const timeout = setTimeout(async () => {
      await supabase.from('user_data').upsert({
        user_id: userId,
        subjects,
        semester_labels: semesterLabels,
        updated_at: new Date().toISOString()
      });
    }, 1000); // 1s debounce

    return () => clearTimeout(timeout);
  }, [subjects, semesterLabels, userId, isLoading]);

  // 3. Fallback: Save to localStorage
  useEffect(() => {
    if (isLoading) return;
    saveActiveSubjects(subjects);
    localStorage.setItem('hnue_gpa_semester_labels', JSON.stringify(semesterLabels));
  }, [subjects, semesterLabels, isLoading]);

  const addSubject = useCallback((initialData?: Partial<Subject>) => {
    setSubjects(prev => [...prev, { ...DEFAULT_SUBJECT(), ...initialData }]);
  }, []);

  const removeSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateSemesterLabel = useCallback((id: string, label: string) => {
    setSemesterLabels(prev => ({ ...prev, [id]: label }));
  }, []);

  const loadSubjects = useCallback((newSubjects: Subject[]) => {
    setSubjects(newSubjects);
  }, []);

  const clearAll = useCallback(() => {
    setSubjects([DEFAULT_SUBJECT()]);
    setSemesterLabels(PRESET_LABELS);
  }, []);

  return { 
    subjects, 
    addSubject, 
    removeSubject, 
    updateSubject, 
    loadSubjects, 
    clearAll,
    semesterLabels,
    updateSemesterLabel,
    isLoading
  };
}
