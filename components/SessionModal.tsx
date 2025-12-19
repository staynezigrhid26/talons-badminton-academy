
import React, { useState } from 'react';
import { TrainingSession, SkillLevel } from '../types';

interface SessionModalProps {
  session: Partial<TrainingSession>;
  onClose: () => void;
  onSave: (session: TrainingSession) => void;
}

const SessionModal: React.FC<SessionModalProps> = ({ session, onClose, onSave }) => {
  // Fix: Use snake_case property names to match TrainingSession interface
  const [formData, setFormData] = useState<Partial<TrainingSession>>({
    id: session.id || `sess${Date.now()}`,
    title: session.title || 'General Training',
    date: session.date || new Date().toISOString().split('T')[0],
    start_time: session.start_time || '04:00 PM',
    end_time: session.end_time || '06:00 PM',
    focus: session.focus || 'Drills & Matches',
    type: session.type || 'Regular',
    target_levels: session.target_levels || [SkillLevel.BEGINNER]
  });

  const toggleLevel = (level: SkillLevel) => {
    // Fix: Use target_levels instead of targetLevels
    const current = formData.target_levels || [];
    if (current.includes(level)) {
      if (current.length > 1) {
        setFormData({ ...formData, target_levels: current.filter(l => l !== level) });
      }
    } else {
      setFormData({ ...formData, target_levels: [...current, level] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as TrainingSession);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-[40px] w-full max-w-md shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 font-black transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Manage Session</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure Training Details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Title</label>
            <input 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Mixed Level Footwork"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Skill Levels (Multi-select)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.values(SkillLevel).map(level => {
                // Fix: Use target_levels instead of targetLevels
                const isActive = formData.target_levels?.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleLevel(level)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input 
                required
                type="date"
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Type</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="Regular">Regular</option>
                <option value="Special">Special</option>
                <option value="Tournament Prep">Tournament Prep</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                // Fix: Use start_time instead of startTime
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                placeholder="04:00 PM"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                // Fix: Use end_time instead of endTime
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                placeholder="06:00 PM"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Training Focus</label>
            <input 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
              value={formData.focus}
              onChange={(e) => setFormData({...formData, focus: e.target.value})}
              placeholder="e.g. Smash accuracy & net play"
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/30 hover:bg-blue-700 active:scale-95 transition-all mt-4">
            Confirm Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;