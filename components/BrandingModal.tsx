
import React, { useState, useRef } from 'react';
import { uploadImage, isSupabaseConfigured } from '../supabaseClient';

interface BrandingModalProps {
  currentName: string;
  currentLogo: string | null;
  currentBanner: string | null;
  onClose: () => void;
  onSave: (name: string, logo: string | null, banner: string | null) => void;
}

const BrandingModal: React.FC<BrandingModalProps> = ({ currentName, currentLogo, currentBanner, onClose, onSave }) => {
  const [name, setName] = useState(currentName);
  const [logo, setLogo] = useState<string | null>(currentLogo);
  const [banner, setBanner] = useState<string | null>(currentBanner);
  const [isUploading, setIsUploading] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setLogo(base64); // Optimistic local

        if (isSupabaseConfigured()) {
          setIsUploading(true);
          const cloudUrl = await uploadImage(base64, 'branding', 'academy_logo');
          if (cloudUrl) setLogo(cloudUrl);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setBanner(base64); // Optimistic local

        if (isSupabaseConfigured()) {
          setIsUploading(true);
          const cloudUrl = await uploadImage(base64, 'branding', 'academy_banner');
          if (cloudUrl) setBanner(cloudUrl);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white p-8 rounded-[48px] w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300 my-8">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 font-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mb-8 text-center md:text-left">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Academy Identity</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Customize the portal's visual branding</p>
        </div>

        <div className="space-y-8">
          {/* Academy Name Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academy Name</label>
            <input 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl outline-none focus:border-blue-600 font-black text-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TALONS ACADEMY"
            />
          </div>

          {/* Logo Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
             <div className="relative group shrink-0">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black italic shadow-xl border-4 border-white overflow-hidden ${!logo ? 'bg-blue-600 text-white' : 'bg-white'} ${isUploading ? 'animate-pulse' : ''}`}>
                  {logo ? <img src={logo} className="w-full h-full object-cover" alt="logo preview" /> : (name ? name.charAt(0) : 'T')}
                </div>
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95 disabled:bg-slate-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </button>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
             </div>
             <div className="flex-1 text-center md:text-left">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Academy Logo</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">This logo appears in the sidebar and dashboard header. Use a square image with a transparent or solid background.</p>
             </div>
          </div>

          {/* Banner Section */}
          <div className="space-y-3">
             <div className="flex justify-between items-end px-2">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Dashboard Banner</h4>
                <button 
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline disabled:text-slate-400"
                >
                  {isUploading ? 'Sending...' : 'Upload New Banner'}
                </button>
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
             </div>
             <div className="relative h-40 rounded-[32px] overflow-hidden bg-slate-900 border-4 border-slate-50 shadow-inner group">
                {banner ? (
                  <img src={banner} className={`w-full h-full object-cover opacity-60 ${isUploading ? 'animate-pulse' : ''}`} alt="banner preview" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No custom banner set</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                   <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Banner Preview</p>
                </div>
             </div>
             <p className="text-[10px] text-slate-400 italic px-2">Recommended: High-resolution landscape image (1920x600px)</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4">
             <button 
               onClick={onClose}
               disabled={isUploading}
               className="flex-1 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition disabled:opacity-50"
             >
               Discard Changes
             </button>
             <button 
               onClick={() => onSave(name, logo, banner)}
               disabled={isUploading}
               className="flex-[2] py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition disabled:bg-slate-400 disabled:shadow-none"
             >
               {isUploading ? 'Uploading Assets...' : 'Apply Branding'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingModal;
