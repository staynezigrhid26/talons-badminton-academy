import React, { useState, useEffect } from 'react';
import { Student, SkillLevel, HealthStatus, UserRole, Tournament } from '../types';
import { generateTrainingPlanSuggestion } from '../geminiService';
import { uploadImage, isSupabaseConfigured } from '../supabaseClient';

interface StudentDetailProps {
  student: Student;
  tournaments: Tournament[];
  onClose: () => void;
  onUpdate: (updatedStudent: Student) => void;
  onDelete?: (id: string) => void;
  role: UserRole;
  isLoggedIn: boolean;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, tournaments, onClose, onUpdate, onDelete, role, isLoggedIn }) => {
  const [isEditing, setIsEditing] = useState(!student.name);
  const [formData, setFormData] = useState<Student>(student);
  const [aiPlan, setAiPlan] = useState<{ weeklyFocus: string; exercises: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isCoach = role === 'coach' && isLoggedIn;

  useEffect(() => {
    setFormData(student);
    setIsEditing(!student.name);
  }, [student.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Athlete name is required.");
      return;
    }
    onUpdate(formData);
  };

  const handleGeneratePlan = async () => {
    if (!isCoach) return;
    setIsGenerating(true);
    const suggestion = await generateTrainingPlanSuggestion(formData);
    if (suggestion) setAiPlan(suggestion);
    setIsGenerating(false);
  };

  const toggleTournament = (tournamentId: string) => {
    const currentIds = formData.tournament_ids || [];
    const newIds = currentIds.includes(tournamentId)
      ? currentIds.filter(id => id !== tournamentId)
      : [...currentIds, tournamentId];
    setFormData({ ...formData, tournament_ids: newIds });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, profile_pic: base64 }));
        if (isSupabaseConfigured()) {
          setIsUploading(true);
          try {
            const cloudUrl = await uploadImage(base64, 'students', formData.name || 'new_student');
            if (cloudUrl) setFormData(prev => ({ ...prev, profile_pic: cloudUrl }));
          } catch (err) {
            console.error("Upload failed.", err);
          } finally {
            setIsUploading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getHealthStatusColor = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.FIT: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case HealthStatus.INJURY: return 'text-rose-600 bg-rose-50 border-rose-100';
      case HealthStatus.RESTING: return 'text-amber-600 bg-amber-50 border-amber-100';
      case HealthStatus.MEDICAL: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case HealthStatus.DISMISSED: return 'text-slate-400 bg-slate-100 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const isDismissed = formData.health_status === HealthStatus.DISMISSED;
  const joinedTournaments = tournaments.filter(t => formData.tournament_ids?.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 bg-white md:bg-black/40 md:flex md:items-center md:justify-center p-0 md:p-4 overflow-y-auto backdrop-blur-sm">
      <div className={`bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-3xl shadow-2xl flex flex-col border border-slate-200 animate-in zoom-in duration-300 transition-all ${isDismissed && !isEditing ? 'bg-slate-50' : ''}`}>
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 md:rounded-t-3xl shadow-sm">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Athlete Profile</h2>
          <div className="flex gap-2">
            {isCoach && (
              <button 
                type="button"
                onClick={(e) => isEditing ? handleSave(e) : setIsEditing(true)}
                disabled={isUploading}
                className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${isEditing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
              >
                {isEditing ? (isUploading ? 'Syncing...' : 'Save Changes') : 'Edit Profile'}
              </button>
            )}
            {!isEditing && <div className="w-10"></div>}
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img 
                src={formData.profile_pic} 
                alt={formData.name || 'New Player'} 
                className={`w-32 h-32 rounded-full object-cover ring-4 ring-blue-50 shadow-lg transition-all ${isDismissed && !isEditing ? 'grayscale opacity-40 scale-95' : ''} ${isUploading ? 'animate-pulse opacity-50' : ''}`} 
              />
              {isEditing && isCoach && (
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity border-2 border-dashed border-white/50 m-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Change Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
            
            {isEditing ? (
              <div className="w-full space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Athlete Full Name" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Birthday</label>
                    <input type="date" className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium outline-none" value={formData.birthday} onChange={(e) => {
                      const bday = e.target.value;
                      if (!bday) return;
                      const age = new Date().getFullYear() - new Date(bday).getFullYear();
                      setFormData({...formData, birthday: bday, age});
                    }} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Skill Level</label>
                    <select className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium outline-none" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value as SkillLevel})}>
                      {Object.values(SkillLevel).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Status</label>
                    <select className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium outline-none" value={formData.health_status} onChange={(e) => setFormData({...formData, health_status: e.target.value as HealthStatus})}>
                      {Object.values(HealthStatus).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className={`text-3xl font-black text-slate-900 tracking-tight transition-all ${isDismissed ? 'text-slate-300 line-through' : ''}`}>{formData.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-slate-500 font-medium">{formData.age} yrs old • {formData.birthday ? new Date(formData.birthday).toLocaleDateString() : 'N/A'}</span>
                  <span className="text-blue-600 font-bold uppercase tracking-wider text-xs">{formData.level}</span>
                </div>
                <div className={`mt-3 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-sm transition-all ${getHealthStatusColor(formData.health_status)}`}>
                  <span className={`w-2 h-2 rounded-full ${formData.health_status === HealthStatus.FIT ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {formData.health_status}
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Tournaments Section */}
          <section className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   Tournaments Joined
                </h4>
             </div>
             {isEditing ? (
               <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar text-xs">
                  {tournaments.length === 0 ? <p className="text-[10px] text-slate-500">No active tournaments available.</p> : tournaments.map(t => (
                    <label key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition">
                       <span className="font-bold">{t.name}</span>
                       <input type="checkbox" checked={formData.tournament_ids?.includes(t.id)} onChange={() => toggleTournament(t.id)} />
                    </label>
                  ))}
               </div>
             ) : (
               <div className="flex flex-wrap gap-2">
                  {joinedTournaments.length > 0 ? joinedTournaments.map(t => (
                    <div key={t.id} className="bg-blue-600/20 border border-blue-600/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.name}</div>
                  )) : <p className="text-[10px] text-slate-500 italic">No tournaments assigned.</p>}
               </div>
             )}
          </section>

          <section className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Coaching Notes</h4>
                {isCoach && !isDismissed && (
                  <button onClick={handleGeneratePlan} disabled={isGenerating} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-md disabled:bg-slate-300">
                    {isGenerating ? 'AI analyzing...' : '✨ AI Suggestion'}
                  </button>
                )}
             </div>
             {isEditing ? (
                <textarea className="w-full p-4 border border-slate-200 rounded-2xl h-32 text-sm outline-none focus:border-blue-600" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Strengths, weaknesses, and focus..." />
             ) : (
                <div className="space-y-4">
                   <p className="text-sm text-slate-600 italic whitespace-pre-wrap leading-relaxed">{formData.notes || "No notes provided."}</p>
                   
                   {/* Restricted AI Training Plan Display */}
                   {aiPlan && isCoach && (
                      <div className="mt-4 p-4 bg-blue-600 text-white rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
                         <h5 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">AI Strategy Blueprint</h5>
                         <p className="font-bold mb-3">{aiPlan.weeklyFocus}</p>
                         <ul className="space-y-1">
                            {aiPlan.exercises.map((ex, i) => (
                               <li key={i} className="text-xs flex items-center gap-2">
                                  <span className="w-1 h-1 bg-white rounded-full"></span>
                                  {ex}
                               </li>
                            ))}
                         </ul>
                      </div>
                   )}
                </div>
             )}
          </section>

          {isCoach && onDelete && (
             <button 
               onClick={() => { if(confirm('Are you sure you want to delete this athlete profile?')) { onDelete(formData.id); onClose(); } }}
               className="w-full py-4 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition"
             >
               Delete Student Profile
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;