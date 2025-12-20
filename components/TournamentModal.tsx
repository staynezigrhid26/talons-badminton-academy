import React, { useState } from 'react';
import { Tournament } from '../types';

interface TournamentModalProps {
  tournament: Partial<Tournament>;
  onClose: () => void;
  onSave: (tour: Tournament) => void;
  onDelete?: (id: string) => void;
  isCoach: boolean;
}

const TournamentModal: React.FC<TournamentModalProps> = ({ tournament, onClose, onSave, onDelete, isCoach }) => {
  const [isEditing, setIsEditing] = useState(!tournament.id);
  const [formData, setFormData] = useState<Partial<Tournament>>({
    id: tournament.id || crypto.randomUUID(),
    name: tournament.name || '',
    date: tournament.date || new Date().toISOString().split('T')[0],
    location: tournament.location || '',
    categories: tournament.categories || ['Open Category'],
    description: tournament.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Tournament);
  };

  const handleAddCategory = () => {
    setFormData(prev => ({ ...prev, categories: [...(prev.categories || []), 'New Event'] }));
  };

  const handleRemoveCategory = (index: number) => {
    setFormData(prev => ({ ...prev, categories: (prev.categories || []).filter((_, i) => i !== index) }));
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCats = [...(formData.categories || [])];
    newCats[index] = value;
    setFormData(prev => ({ ...prev, categories: newCats }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white p-8 rounded-[40px] w-full max-w-xl shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 font-black transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Tournament Entry</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Official Event Records</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Talons Cup 2024" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Venue</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Location Name" />
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Date</label>
               <input required type="date" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categories</label>
                <button type="button" onClick={handleAddCategory} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Add Category</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {formData.categories?.map((cat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input required className="flex-1 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-600 font-bold text-xs" value={cat} onChange={(e) => handleCategoryChange(idx, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm h-32 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Event details..." />
            </div>
            
            <div className="flex gap-4 mt-6">
               <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition">
                 {tournament.id ? 'Save Updates' : 'Add Tournament'}
               </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-[32px] border">
               <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">{formData.name}</h1>
               <div className="flex flex-wrap gap-2">
                  {formData.categories?.map((cat, idx) => (
                    <span key={idx} className="text-blue-600 font-black text-[9px] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{cat}</span>
                  ))}
               </div>
            </div>
            {isCoach && (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Edit</button>
                <button onClick={() => { if(confirm("Delete this tournament?")) { onDelete!(formData.id!); onClose(); } }} className="bg-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentModal;