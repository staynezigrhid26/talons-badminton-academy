import React, { useState } from 'react';
import { Announcement } from '../types';

interface AnnouncementModalProps {
  announcement: Partial<Announcement>;
  onClose: () => void;
  onSave: (ann: Announcement) => void;
  onDelete?: (id: string) => void;
  isCoach: boolean;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ announcement, onClose, onSave, onDelete, isCoach }) => {
  const [isEditing, setIsEditing] = useState(!announcement.id);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    id: announcement.id || crypto.randomUUID(),
    title: announcement.title || '',
    content: announcement.content || '',
    date: announcement.date || new Date().toISOString().split('T')[0],
    author: announcement.author || 'Admin'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Announcement);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-[40px] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 font-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Academy News</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Official Communications</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headline</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Title" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content</label>
              <textarea required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm h-32 resize-none" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Announcement text..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <input required type="date" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source</label>
                <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition">
                {announcement.id ? 'Update News' : 'Publish News'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
             <div className="bg-slate-50 p-6 rounded-[32px] border">
                <p className="text-[9px] font-black text-blue-600 uppercase mb-2">{formData.date} • {formData.author}</p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{formData.title}</h1>
             </div>
             <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{formData.content}</p>
             {isCoach && (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Edit</button>
                <button onClick={() => { if(confirm("Delete this announcement?")) { onDelete!(formData.id!); onClose(); } }} className="bg-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Delete</button>
              </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementModal;