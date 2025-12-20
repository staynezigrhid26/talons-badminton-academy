import React, { useState } from 'react';
import { DailyPlan, Exercise } from '../types';

interface DailyPlanModalProps {
  plan: Partial<DailyPlan>;
  onClose: () => void;
  onSave: (plan: DailyPlan) => void;
}

const DailyPlanModal: React.FC<DailyPlanModalProps> = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<DailyPlan>>({
    id: plan.id || crypto.randomUUID(),
    date: plan.date || new Date().toISOString().split('T')[0],
    start_time: plan.start_time || '04:00 PM',
    end_time: plan.end_time || '06:00 PM',
    total_duration: plan.total_duration || '120 mins',
    title: plan.title || '',
    exercises: plan.exercises || [{ name: '', duration: '' }],
    notes: plan.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as DailyPlan);
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    const newEx = [...(formData.exercises || [])];
    newEx[index] = { ...newEx[index], [field]: value };
    setFormData({ ...formData, exercises: newEx });
  };

  const addExercise = () => {
    setFormData({ ...formData, exercises: [...(formData.exercises || []), { name: '', duration: '' }] });
  };

  const removeExercise = (index: number) => {
    const newEx = (formData.exercises || []).filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newEx });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-[40px] w-full max-lg shadow-2xl relative animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 font-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900">Training Blueprint</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Daily Drill Breakdown</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Title</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Afternoon Power Drills" />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/30 active:scale-95 transition mt-6">
            Save Training Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailyPlanModal;