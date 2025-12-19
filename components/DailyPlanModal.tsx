
import React, { useState } from 'react';
import { DailyPlan, Exercise } from '../types';

interface DailyPlanModalProps {
  plan: Partial<DailyPlan>;
  onClose: () => void;
  onSave: (plan: DailyPlan) => void;
}

const DailyPlanModal: React.FC<DailyPlanModalProps> = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<DailyPlan>>({
    id: plan.id || `dp${Date.now()}`,
    date: plan.date || new Date().toISOString().split('T')[0],
    startTime: plan.startTime || '04:00 PM',
    endTime: plan.endTime || '06:00 PM',
    totalDuration: plan.totalDuration || '120 mins',
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
      <div className="bg-white p-8 rounded-[40px] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 font-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900">Training Blueprint</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Daily Drill & Exercise Breakdown</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Title</label>
            <input 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Afternoon Power Drills"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Training Date</label>
               <input 
                required
                type="date"
                className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl outline-none focus:border-blue-600 font-bold text-xs"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl outline-none focus:border-blue-600 font-bold text-xs"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                placeholder="04:00 PM"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl outline-none focus:border-blue-600 font-bold text-xs"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                placeholder="06:00 PM"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Duration</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl outline-none focus:border-blue-600 font-bold text-xs"
                value={formData.totalDuration}
                onChange={(e) => setFormData({...formData, totalDuration: e.target.value})}
                placeholder="120 mins"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
              Exercises & Drills
              <button type="button" onClick={addExercise} className="text-blue-600 hover:text-blue-800 text-[9px]">+ Add Drill</button>
            </label>
            <div className="space-y-3 mt-3">
              {formData.exercises?.map((ex, index) => (
                <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                  <div className="flex-1 space-y-2">
                    <input 
                      required
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl outline-none focus:border-blue-600 font-bold text-xs"
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      placeholder="Drill Name"
                    />
                    <input 
                      required
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl outline-none focus:border-blue-600 font-bold text-[10px]"
                      value={ex.duration}
                      onChange={(e) => handleExerciseChange(index, 'duration', e.target.value)}
                      placeholder="Duration (e.g. 15 mins)"
                    />
                  </div>
                  {index > 0 && (
                    <button type="button" onClick={() => removeExercise(index)} className="text-rose-400 hover:text-rose-600 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Training Information / Notepad</label>
            <textarea 
              className="w-full mt-2 bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl outline-none focus:border-blue-600 font-medium text-sm h-32 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add additional session details, coaching cues, or logistical notes here..."
            />
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
