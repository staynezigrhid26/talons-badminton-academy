
import React, { useState, useRef } from 'react';
import { Officer } from '../types';
import { uploadImage, isSupabaseConfigured } from '../supabaseClient';

interface OfficerDetailProps {
  officer: Officer;
  onClose: () => void;
  onUpdate: (updated: Officer) => void;
  onDelete?: (id: string) => void;
  canEdit: boolean;
}

const OfficerDetail: React.FC<OfficerDetailProps> = ({ officer, onClose, onUpdate, onDelete, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Officer>(officer);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Fix: Use profile_pic instead of profilePic
        setFormData(prev => ({ ...prev, profile_pic: base64 }));

        if (isSupabaseConfigured()) {
          setIsUploading(true);
          const cloudUrl = await uploadImage(base64, 'officers', formData.name);
          if (cloudUrl) {
            // Fix: Use profile_pic instead of profilePic
            setFormData(prev => ({ ...prev, profile_pic: cloudUrl }));
          }
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white md:bg-black/40 md:flex md:items-center md:justify-center p-0 md:p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white w-full h-full md:h-auto md:max-w-xl md:rounded-3xl shadow-2xl flex flex-col border border-slate-200 animate-in zoom-in duration-300">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 md:rounded-t-3xl">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-black text-slate-800">Officer Profile</h2>
          <div className="flex gap-2">
            {canEdit && (
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isUploading}
                className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition ${isEditing ? 'bg-blue-600 text-white' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
              >
                {isEditing ? (isUploading ? 'Saving...' : 'Save') : 'Edit'}
              </button>
            )}
            {!isEditing && <div className="w-10"></div>}
          </div>
        </div>

        <div className="p-6 space-y-8">
           <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img 
                  // Fix: Use profile_pic instead of profilePic
                  src={formData.profile_pic} 
                  alt={formData.name} 
                  className={`w-32 h-32 rounded-full object-cover ring-4 ring-blue-100 shadow-md transition-all group-hover:ring-blue-200 ${isUploading ? 'animate-pulse opacity-50' : ''}`} 
                />
                {isEditing && (
                  <label 
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity border-2 border-dashed border-white/50 m-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Update'}</span>
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                  </label>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Name</label>
                    <input 
                      className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Role</label>
                    <input 
                      className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      placeholder="e.g. President"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact #</label>
                    <input 
                      className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                      value={formData.contact || ''}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formData.name}</h3>
                  <p className="text-blue-600 font-black text-sm uppercase tracking-[0.15em] mt-1 px-4 py-1 bg-blue-50 rounded-full inline-block">{formData.role}</p>
                </div>
              )}
           </div>

           {!isEditing && (
             <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center shadow-inner">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Official Contact</p>
                   <p className="text-slate-800 font-bold text-lg">{formData.contact || 'Not provided'}</p>
                </div>
             </div>
           )}

           {canEdit && onDelete && !isEditing && (
              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => {
                    if(confirm(`Remove ${formData.name} from academy officers?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="w-full py-4 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition"
                >
                  Remove from Officers
                </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default OfficerDetail;