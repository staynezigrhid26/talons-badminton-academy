
import React, { useState, useRef } from 'react';
import { Coach } from '../types';
import { uploadImage, isSupabaseConfigured } from '../supabaseClient';

interface CoachDetailProps {
  coach: Coach;
  onClose: () => void;
  onUpdate: (updatedCoach: Coach) => void;
  onDelete?: (id: string) => void;
  canEdit: boolean;
}

const CoachDetail: React.FC<CoachDetailProps> = ({ coach, onClose, onUpdate, onDelete, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Coach>(coach);
  const [showPassword, setShowPassword] = useState(false);
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
        
        // Optimistic preview
        // Fix: Use profile_pic instead of profilePic
        setFormData(prev => ({ ...prev, profile_pic: base64 }));

        if (isSupabaseConfigured()) {
          setIsUploading(true);
          const cloudUrl = await uploadImage(base64, 'coaches', formData.name);
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
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 md:rounded-t-3xl shadow-sm">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-black text-slate-800">Coach Profile</h2>
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
                  className={`w-32 h-32 rounded-full object-cover ring-4 ring-blue-100 shadow-lg ${isUploading ? 'animate-pulse opacity-50' : ''}`} 
                />
                {isEditing && (
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity border-2 border-dashed border-white/50 m-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">{isUploading ? 'Uploading...' : 'Change Image'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                  </label>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input 
                        className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Age</label>
                      <input 
                        type="number"
                        className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                      <input 
                        className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Specialization</label>
                      <input 
                        className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input 
                        className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 relative">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Update Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          className="w-full mt-1 p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all pr-12"
                          value={formData.password || ''}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formData.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1 mb-2">
                    <span className="text-slate-500 font-medium">{formData.age} years old</span>
                  </div>
                  <p className="text-blue-600 font-bold text-sm uppercase tracking-widest px-4 py-1 bg-blue-50 rounded-full inline-block">{formData.specialization}</p>
                </div>
              )}
           </div>

           {!isEditing && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center shadow-inner">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                   <p className="text-slate-800 font-bold text-sm truncate">{formData.email}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center shadow-inner">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                   <p className="text-slate-800 font-bold text-sm">{formData.phone || 'N/A'}</p>
                </div>
             </div>
           )}

           {canEdit && onDelete && !isEditing && (
              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => {
                    if(confirm(`Remove ${formData.name} from academy coaches?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="w-full py-4 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition"
                >
                  Terminate Coach Contract
                </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CoachDetail;