import React, { useState } from 'react';
import { TrainingSession, SkillLevel } from '../types';

interface SessionModalProps {
  session: Partial<TrainingSession>;
  onClose: () => void;
  onSave: (session: TrainingSession) => void;
  onDelete?: (id: string) => void;
  isCoach: boolean;
}

const SessionModal: React.FC<SessionModalProps> = ({ session, onClose, onSave, onDelete, isCoach }) => {
  const [formData, setFormData] = useState<Partial<TrainingSession>>({
    id: session.id || crypto.randomUUID(),
    title: session.title || 'General Training',
    date: session.date || new Date().toISOString().split('T')[0],
    start_time: session.start_time || '04:00 PM',
    end_time: session.end_time || '06:00 PM',
    focus: session.focus || 'Drills & Matches',
    type: session.type || 'Regular',
    target_levels: session.target_levels || [SkillLevel.BEGINNER]
  });

  const toggleLevel = (level: SkillLevel) => {
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
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white p-8 rounded-[40px] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300 my-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Title</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Mixed Level Footwork" />
            </div>
            
            <div className="col-span-1 md:col-span-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Focus</label>
               <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.focus} onChange={(e) => setFormData({...formData, focus: e.target.value})} placeholder="e.g. Smash Accuracy" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input type="date" required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}>
                <option value="Regular">Regular</option>
                <option value="Special">Special</option>
                <option value="Tournament Prep">Tournament Prep</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} placeholder="04:00 PM" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} placeholder="06:00 PM" />
            </div>
          </div>

          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Skill Levels</label>
             <div className="flex flex-wrap gap-2 mt-2">
                {Object.values(SkillLevel).map(lvl => (
                  <button 
                    key={lvl} 
                    type="button" 
                    onClick={() => toggleLevel(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.target_levels?.includes(lvl) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
                  >
                    {lvl}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/30 hover:bg-blue-700 active:scale-95 transition-all">
              Confirm Session
            </button>
            {session.id && onDelete && (
              <button 
                type="button" 
                onClick={() => { if(confirm("Delete this session from schedule?")) { onDelete(formData.id!); onClose(); } }} 
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

export default SessionModal;