import React, { useState } from 'react';
import { DailyPlan, Exercise } from '../types';

interface DailyPlanModalProps {
  plan: Partial<DailyPlan>;
  onClose: () => void;
  onSave: (plan: DailyPlan) => void;
  onDelete?: (id: string) => void;
  isCoach: boolean;
}

const DailyPlanModal: React.FC<DailyPlanModalProps> = ({ plan, onClose, onSave, onDelete, isCoach }) => {
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
      <div className="bg-white p-8 rounded-[40px] w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 font-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900">Training Blueprint</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Daily Drill Breakdown</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Title</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Afternoon Power Drills" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
              <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (e.g. 120 mins)</label>
              <input className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.total_duration} onChange={(e) => setFormData({...formData, total_duration: e.target.value})} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drills & Exercises</label>
              <button type="button" onClick={addExercise} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Add Drill</button>
            </div>
            <div className="space-y-3">
              {formData.exercises?.map((ex, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex-1 space-y-2">
                    <input required className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none focus:border-blue-500" placeholder="Drill Name" value={ex.name} onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)} />
                    <input required className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none focus:border-blue-500" placeholder="Duration (e.g. 15m)" value={ex.duration} onChange={(e) => handleExerciseChange(idx, 'duration', e.target.value)} />
                  </div>
                  {idx > 0 && (
                    <button type="button" onClick={() => removeExercise(idx)} className="text-rose-400 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coaching Notes</label>
             <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm h-24 resize-none" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional focus areas..." />
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/30 active:scale-95 transition">
              Save Plan
            </button>
            {plan.id && onDelete && (
              <button 
                type="button" 
                onClick={() => { if(confirm("Delete this training plan?")) { onDelete(formData.id!); onClose(); } }} 
                className="flex-1 bg-rose-50 text-rose-600 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-100 transition"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyPlanModal;