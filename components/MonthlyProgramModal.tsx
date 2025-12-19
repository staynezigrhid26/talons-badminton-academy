
import React, { useState } from 'react';
import { MonthlyProgram } from '../types';

interface MonthlyProgramModalProps {
  program: Partial<MonthlyProgram>;
  onClose: () => void;
  onSave: (program: MonthlyProgram) => void;
}

const MonthlyProgramModal: React.FC<MonthlyProgramModalProps> = ({ program, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<MonthlyProgram>>({
    id: program.id || `mp${Date.now()}`,
    month: program.month || new Date().toISOString().slice(0, 7),
    title: program.title || '',
    description: program.description || '',
    goals: program.goals || ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as MonthlyProgram);
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...(formData.goals || [])];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const addGoal = () => {
    setFormData({ ...formData, goals: [...(formData.goals || []), ''] });
  };

  const removeGoal = (index: number) => {
    const newGoals = (formData.goals || []).filter((_, i) => i !== index);
    setFormData({ ...formData, goals: newGoals });
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
          <h3 className="text-2xl font-black text-slate-900">Monthly Curriculum</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Define Monthly Training Goals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Month</label>
              <input 
                required
                type="month"
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Program Title</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Smash & Net Play"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">General Description</label>
            <textarea 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm h-24"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Outline the focus for this month..."
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
              Key Goals & Outcomes
              <button type="button" onClick={addGoal} className="text-blue-600 hover:text-blue-800">+ Add Goal</button>
            </label>
            <div className="space-y-2 mt-2">
              {formData.goals?.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    required
                    className="flex-1 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-600 font-bold text-xs"
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                    placeholder={`Goal #${index + 1}`}
                  />
                  {index > 0 && (
                    <button type="button" onClick={() => removeGoal(index)} className="text-rose-400 hover:text-rose-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/30 active:scale-95 transition mt-4">
            Confirm Monthly Program
          </button>
        </form>
      </div>
    </div>
  );
};

export default MonthlyProgramModal;
