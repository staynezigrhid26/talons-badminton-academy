import React, { useState, useMemo } from 'react';
import { Tournament, TournamentDay } from '../types';

interface TournamentModalProps {
  tournament: Partial<Tournament>;
  onClose: () => void;
  onSave: (tour: Tournament) => void;
  onDelete?: (id: string) => void;
  isCoach: boolean;
}

const TournamentModal: React.FC<TournamentModalProps> = ({ tournament, onClose, onSave, onDelete, isCoach }) => {
  const [isEditing, setIsEditing] = useState(!tournament.id);
  const [saveLoading, setSaveLoading] = useState(false);

  // Initialize schedule. If empty, create one day from the old 'date' field
  const initialSchedule: TournamentDay[] = useMemo(() => {
    if (tournament.schedule && tournament.schedule.length > 0) {
      return tournament.schedule;
    }
    return [{
      date: tournament.date || new Date().toISOString().split('T')[0],
      categories: tournament.categories || ['Open Category']
    }];
  }, [tournament]);

  const [formData, setFormData] = useState<Partial<Tournament>>({
    id: tournament.id || crypto.randomUUID(),
    name: tournament.name || '',
    location: tournament.location || '',
    description: tournament.description || '',
    schedule: initialSchedule
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    
    // Sort schedule by date
    const sortedSchedule = [...(formData.schedule || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Set primary date and combined categories for backward compatibility/sorting
    const primaryDate = sortedSchedule[0]?.date || new Date().toISOString().split('T')[0];
    const flatCategories = Array.from(new Set(sortedSchedule.flatMap(day => day.categories)));

    const record: Tournament = {
      ...formData as Tournament,
      date: primaryDate,
      categories: flatCategories,
      schedule: sortedSchedule
    };

    if (!record.description || record.description.trim() === '') {
      delete record.description;
    }

    try {
      await onSave(record);
    } catch (err: any) {
      alert("Error saving tournament. Ensure the 'schedule' column exists in your database.");
    } finally {
      setSaveLoading(false);
    }
  };

  const addDay = () => {
    const lastDay = formData.schedule?.[formData.schedule.length - 1];
    let nextDate = new Date().toISOString().split('T')[0];
    
    if (lastDay) {
      const d = new Date(lastDay.date);
      d.setDate(d.getDate() + 1);
      nextDate = d.toISOString().split('T')[0];
    }

    setFormData(prev => ({
      ...prev,
      schedule: [...(prev.schedule || []), { date: nextDate, categories: ['New Event'] }]
    }));
  };

  const removeDay = (index: number) => {
    if ((formData.schedule || []).length <= 1) return;
    setFormData(prev => ({
      ...prev,
      schedule: (prev.schedule || []).filter((_, i) => i !== index)
    }));
  };

  const updateDayDate = (index: number, date: string) => {
    const newSchedule = [...(formData.schedule || [])];
    newSchedule[index].date = date;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const addCategoryToDay = (dayIndex: number) => {
    const newSchedule = [...(formData.schedule || [])];
    newSchedule[dayIndex].categories.push('New Event');
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeCategoryFromDay = (dayIndex: number, catIndex: number) => {
    const newSchedule = [...(formData.schedule || [])];
    newSchedule[dayIndex].categories = newSchedule[dayIndex].categories.filter((_, i) => i !== catIndex);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updateCategoryInDay = (dayIndex: number, catIndex: number, value: string) => {
    const newSchedule = [...(formData.schedule || [])];
    newSchedule[dayIndex].categories[catIndex] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white p-6 md:p-10 rounded-[40px] w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300 my-auto">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 font-black transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Tournament Management</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Multi-Day Event Scheduling</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Talons Cup" />
               </div>
               <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Venue Name" />
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">Event Schedule</label>
                <button type="button" onClick={addDay} className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all">+ Add Another Day</button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.schedule?.map((day, dIdx) => (
                  <div key={dIdx} className="p-4 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-4 relative group">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Day {dIdx + 1} Date</label>
                        <input type="date" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-blue-600" value={day.date} onChange={(e) => updateDayDate(dIdx, e.target.value)} />
                      </div>
                      <div className="flex-[2]">
                         <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase">Day {dIdx + 1} Categories</label>
                            <button type="button" onClick={() => addCategoryToDay(dIdx)} className="text-[8px] font-black text-blue-600 uppercase tracking-widest">+ Add Event</button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {day.categories.map((cat, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg pr-1">
                                <input required className="bg-transparent p-1.5 text-[10px] font-bold outline-none w-24" value={cat} onChange={(e) => updateCategoryInDay(dIdx, cIdx, e.target.value)} />
                                {day.categories.length > 1 && (
                                  <button type="button" onClick={() => removeCategoryFromDay(dIdx, cIdx)} className="text-rose-500 text-xs px-1 hover:scale-125 transition-all">×</button>
                                )}
                              </div>
                            ))}
                         </div>
                      </div>
                      {formData.schedule!.length > 1 && (
                        <button type="button" onClick={() => removeDay(dIdx)} className="absolute -top-2 -right-2 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About the Event</label>
              <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Event rules, fees, etc..." />
            </div>
            
            <div className="flex gap-4">
               <button type="submit" disabled={saveLoading} className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition disabled:bg-slate-300">
                 {saveLoading ? 'Syncing...' : (tournament.id ? 'Update Tournament' : 'Publish Tournament')}
               </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">{formData.name}</h1>
               <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6">{formData.location}</p>
               
               <div className="space-y-6">
                  {formData.schedule?.map((day, idx) => (
                    <div key={idx} className="border-l-2 border-blue-600/30 pl-4 space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                       </p>
                       <div className="flex flex-wrap gap-2">
                          {day.categories.map((cat, cidx) => (
                            <span key={cidx} className="bg-white/10 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10">{cat}</span>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            {formData.description && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{formData.description}</p>
              </div>
            )}

            {isCoach && (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Edit Details</button>
                <button onClick={() => { if(confirm("Permanently delete this tournament?")) { onDelete!(formData.id!); onClose(); } }} className="bg-rose-100 text-rose-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-200 transition-all">Delete Event</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentModal;