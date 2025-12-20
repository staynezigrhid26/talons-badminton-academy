import React, { useState, useRef } from 'react';
import { Officer } from '../types';
import { uploadImage, isSupabaseConfigured } from '../supabaseClient';

interface OfficerModalProps {
  onClose: () => void;
  onSave: (officer: Officer) => void;
}

const OfficerModal: React.FC<OfficerModalProps> = ({ onClose, onSave }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Officer>>({
    id: crypto.randomUUID(),
    name: '',
    role: '',
    contact: '',
    profile_pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, profile_pic: base64 }));

        if (isSupabaseConfigured()) {
          setIsUploading(true);
          const cloudUrl = await uploadImage(base64, 'officers', formData.name || 'new_officer');
          if (cloudUrl) {
            setFormData(prev => ({ ...prev, profile_pic: cloudUrl }));
          }
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.role && !isUploading) {
      onSave(formData as Officer);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white p-8 rounded-[40px] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300 my-8">
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 font-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900">Appoint Officer</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Academy Leadership Position</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div className="relative group">
              <img 
                src={formData.profile_pic} 
                className={`w-24 h-24 rounded-full object-cover ring-4 ring-blue-50 shadow-md ${isUploading ? 'animate-pulse opacity-50' : ''}`} 
                alt="Preview" 
              />
              <label 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'hidden' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </label>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Officer Name"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role / Title</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                placeholder="e.g. Club Secretary"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Details</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                placeholder="Phone or Email"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isUploading}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition mt-4 ${isUploading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-900/30 hover:bg-blue-700'}`}
          >
            {isUploading ? 'Finalizing Upload...' : 'Add to Leadership'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfficerModal;