import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Student, Coach, Tournament, UserState, Announcement, SkillLevel, HealthStatus, Officer, DailyPlan, TrainingSession, AttendanceRecord } from './types';
import { INITIAL_STUDENTS, INITIAL_COACHES, MOCK_TOURNAMENTS, INITIAL_ANNOUNCEMENTS, INITIAL_OFFICERS, INITIAL_DAILY_PLANS, INITIAL_SESSIONS } from './constants';
import { isSupabaseConfigured, checkStorageConfig, fetchData, upsertRecord, deleteRecord } from './supabaseClient';
import StudentCard from './components/StudentCard';
import StudentDetail from './components/StudentDetail';
import CoachDetail from './components/CoachDetail';
import CoachModal from './components/CoachModal';
import OfficerDetail from './components/OfficerDetail';
import OfficerModal from './components/OfficerModal';
import AnnouncementModal from './components/AnnouncementModal';
import TournamentModal from './components/TournamentModal';
import DailyPlanModal from './components/DailyPlanModal';
import SessionModal from './components/SessionModal';
import BrandingModal from './components/BrandingModal';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>({ isLoggedIn: false, role: 'student', profile: null });
  const [loading, setLoading] = useState(true);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Branding States
  const [academyName, setAcademyName] = useState('TALONS ACADEMY');
  const [academyLogo, setAcademyLogo] = useState<string | null>(null);
  const [academyBanner, setAcademyBanner] = useState<string | null>(null);
  const [showBrandingModal, setShowBrandingModal] = useState(false);

  // Database States
  const [students, setStudents] = useState<Student[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'coaches' | 'schedule' | 'attendance' | 'officers' | 'plans'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isAddingCoach, setIsAddingCoach] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isAddingOfficer, setIsAddingOfficer] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [editingTournament, setEditingTournament] = useState<Partial<Tournament> | null>(null);
  const [editingDailyPlan, setEditingDailyPlan] = useState<Partial<DailyPlan> | null>(null);
  const [editingSession, setEditingSession] = useState<Partial<TrainingSession> | null>(null);
  
  const isCoach = user.role === 'coach' && user.isLoggedIn;

  const sortedOfficers = useMemo(() => {
    const rankMap: Record<string, number> = { 'President': 1, 'Vice President': 2, 'Secretary': 3, 'Treasurer': 4 };
    return [...(officers || [])].sort((a, b) => (rankMap[a.role] || 99) - (rankMap[b.role] || 99));
  }, [officers]);

  useEffect(() => {
    const fetchEverything = async () => {
      setLoading(true);
      const isConfigured = isSupabaseConfigured();
      setCloudEnabled(isConfigured);

      if (isConfigured) {
        try {
          const [dbStudents, dbCoaches, dbTournaments, dbAnnouncements, dbPlans, dbSessions, dbOfficers] = await Promise.all([
            fetchData('students'), fetchData('coaches'), fetchData('tournaments'),
            fetchData('announcements'), fetchData('daily_plans'), fetchData('sessions'),
            fetchData('officers')
          ]);
          setStudents(dbStudents || INITIAL_STUDENTS);
          setCoaches(dbCoaches || INITIAL_COACHES);
          setTournaments(dbTournaments || MOCK_TOURNAMENTS);
          setAnnouncements(dbAnnouncements || INITIAL_ANNOUNCEMENTS);
          setDailyPlans(dbPlans || INITIAL_DAILY_PLANS);
          setSessions(dbSessions || INITIAL_SESSIONS);
          setOfficers(dbOfficers || INITIAL_OFFICERS);
        } catch (err) {
          console.warn("Using local defaults due to fetch error.");
        }
      } else {
        const loadKey = (k: string, d: any) => {
          const s = localStorage.getItem(`talons_${k}`);
          return s ? JSON.parse(s) : d;
        };
        setStudents(loadKey('students', INITIAL_STUDENTS));
        setCoaches(loadKey('coaches', INITIAL_COACHES));
        setTournaments(loadKey('tournaments', MOCK_TOURNAMENTS));
        setAnnouncements(loadKey('announcements', INITIAL_ANNOUNCEMENTS));
        setDailyPlans(loadKey('plans', INITIAL_DAILY_PLANS));
        setSessions(loadKey('sessions', INITIAL_SESSIONS));
        setOfficers(loadKey('officers', INITIAL_OFFICERS));
      }
      setLoading(false);
    };
    fetchEverything();
  }, []);

  const handleUpdateRecord = async (table: string, record: any, stateSetter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (cloudEnabled) {
      try {
        const saved = await upsertRecord(table, record);
        if (saved) stateSetter(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
      } catch (e: any) {
        alert(`Supabase Error: ${e.message || 'Check browser console for SQL details.'}`);
      }
    } else {
      stateSetter(prev => [record, ...prev.filter(r => r.id !== record.id)]);
      localStorage.setItem(`talons_${table}`, JSON.stringify([record, ...(JSON.parse(localStorage.getItem(`talons_${table}`) || '[]').filter((r:any) => r.id !== record.id))]));
    }
  };

  const handleDeleteRecord = async (table: string, id: string, stateSetter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (cloudEnabled) {
      try {
        await deleteRecord(table, id);
        stateSetter(prev => prev.filter(r => r.id !== id));
      } catch (e) { alert("Delete failed."); }
    } else {
      stateSetter(prev => prev.filter(r => r.id !== id));
    }
  };

  // Fix: Added missing update handler functions
  const updateStudent = (student: Student) => handleUpdateRecord('students', student, setStudents);
  const updateCoach = (coach: Coach) => handleUpdateRecord('coaches', coach, setCoaches);
  const updateOfficer = (officer: Officer) => handleUpdateRecord('officers', officer, setOfficers);

  // Fix: Added missing handleLogin function
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    
    const coach = coaches.find(c => c.email === email && c.password === password);
    if (coach) {
      setUser({ isLoggedIn: true, role: 'coach', profile: coach });
      setShowLoginModal(false);
      setLoginError('');
    } else {
      setLoginError('Invalid email or password');
      alert('Invalid credentials');
    }
  };

  const handleToggleAttendance = (student: Student, date: string) => {
    if (!isCoach) return;
    const att = student.attendance || [];
    const existing = att.find(r => r.date === date);
    const nextAtt = existing 
      ? att.map(r => r.date === date ? { ...r, status: r.status === 'present' ? 'absent' : 'present' } : r)
      : [{ date, status: 'present' as const }, ...att];
    handleUpdateRecord('students', { ...student, attendance: nextAtt }, setStudents);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const d = await checkStorageConfig();
    alert(d.message);
    setIsSyncing(false);
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-900 gap-4"><div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div><p className="font-black text-blue-400 uppercase tracking-widest text-[10px]">Cloud Syncing...</p></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 bg-slate-50 selection:bg-blue-100">
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex-col p-8 z-40 border-r border-white/5">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-2xl overflow-hidden">
            {academyLogo ? <img src={academyLogo} className="w-full h-full object-cover" /> : academyName.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-sm font-black truncate uppercase">{academyName}</h1>
            <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mt-1">Academy Pro</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'students', label: 'Players', icon: '🎾' },
            { id: 'coaches', label: 'Coaches', icon: '👔' },
            { id: 'schedule', label: 'Schedule', icon: '📅' },
            { id: 'attendance', label: 'Attendance', icon: '📊' },
            { id: 'officers', label: 'Officers', icon: '👥' },
            { id: 'plans', label: 'Training Plans', icon: '📋' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-bold flex items-center gap-4 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/10 mt-auto">
          {user.isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl overflow-hidden">
                <img src={user.profile?.profilePic} className="w-10 h-10 rounded-xl object-cover" />
                <div className="truncate"><p className="text-xs font-black truncate">{user.profile?.name}</p></div>
              </div>
              <button onClick={() => setUser({isLoggedIn: false, role: 'student', profile: null})} className="w-full py-2 bg-rose-900/20 text-[8px] font-black uppercase text-rose-400 rounded-lg">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase">Coach Portal</button>
          )}
        </div>
      </aside>

      <main className="p-6 md:p-12 max-w-6xl mx-auto min-h-screen">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="relative rounded-[48px] overflow-hidden bg-slate-900 text-white shadow-2xl p-10 min-h-[300px] flex flex-col justify-center border-4 border-white">
                {academyBanner && <img src={academyBanner} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                <div className="relative z-10">
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 uppercase italic">{academyName}</h1>
                  <p className="text-blue-400 font-black text-xs uppercase tracking-[0.4em]">Elite Management Portal</p>
                  {isCoach && <button onClick={handleManualSync} disabled={isSyncing} className="mt-8 bg-emerald-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase">Cloud Check</button>}
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black uppercase">Tournaments</h2>{isCoach && <button onClick={() => setEditingTournament({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl font-black text-xl shadow-lg">+</button>}</div>
                   <div className="space-y-4">
                      {(tournaments || []).map(t => (
                        <div key={t.id} onClick={() => setEditingTournament(t)} className="p-5 bg-slate-50 rounded-3xl border flex items-center gap-5 cursor-pointer">
                           <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center shrink-0">
                              <p className="text-[10px] font-black uppercase text-blue-600 leading-none">{new Date(t.date).toLocaleString('default', { month: 'short' })}</p>
                              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{new Date(t.date).getDate()}</p>
                           </div>
                           <div className="overflow-hidden"><h3 className="font-black text-slate-800 text-lg leading-none truncate">{t.name}</h3><p className="text-[10px] text-slate-400 uppercase font-black mt-2">{t.location}</p></div>
                        </div>
                      ))}
                   </div>
                </section>
                <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black uppercase">News</h2>{isCoach && <button onClick={() => setEditingAnnouncement({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl font-black text-xl shadow-lg">+</button>}</div>
                   <div className="space-y-6">
                      {(announcements || []).map(a => (
                        <div key={a.id} onClick={() => setEditingAnnouncement(a)} className="pb-6 border-b border-slate-50 last:border-0 p-4 rounded-3xl cursor-pointer">
                           <p className="text-[9px] font-black text-blue-600 uppercase mb-2 bg-blue-50 px-3 py-1 rounded-full inline-block">{a.date}</p>
                           <h3 className="text-xl font-black text-slate-800">{a.title}</h3>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
              <h2 className="text-5xl font-black tracking-tighter uppercase italic">Athletes</h2>
              <div className="flex gap-4 w-full md:w-auto">
                <input type="text" placeholder="Search..." className="bg-white border-2 border-slate-100 px-6 py-4 rounded-3xl text-sm font-bold flex-1 md:w-64 outline-none focus:border-blue-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {isCoach && <button onClick={() => setSelectedStudent({ id: `s${Date.now()}`, name: '', age: 0, birthday: '', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new', level: SkillLevel.BEGINNER, healthStatus: HealthStatus.FIT, attendance: [], tournamentIds: [], notes: '' })} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl">Add Athlete</button>}
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(students || []).filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(s => <StudentCard key={s.id} student={s} onClick={() => setSelectedStudent(s)} />)}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-5xl font-black tracking-tighter uppercase italic">Schedule</h2>
               {isCoach && <button onClick={() => setEditingSession({})} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl">Add Session</button>}
            </header>
            <div className="space-y-4">
               {[...(sessions || [])].sort((a,b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime()).map(s => (
                 <div key={s.id} onClick={() => isCoach && setEditingSession(s)} className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 group cursor-pointer hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
                       <span className="text-[9px] font-black uppercase leading-none opacity-80">{new Date(s.date || '').toLocaleString('default', { month: 'short' })}</span>
                       <span className="text-xl font-black leading-none mt-1">{new Date(s.date || '').getDate()}</span>
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-1"><h3 className="font-black text-xl text-slate-800 uppercase">{s.title}</h3><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.type === 'Special' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{s.type}</span></div>
                       <p className="text-slate-500 font-bold text-sm">{s.startTime} - {s.endTime} • <span className="text-slate-400 font-medium italic">{s.focus}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">{(s.targetLevels || []).map(lvl => <span key={lvl} className="text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-3 py-1 rounded-full">{lvl}</span>)}</div>
                 </div>
               ))}
               {(sessions || []).length === 0 && <div className="p-12 text-center text-slate-300 font-black uppercase tracking-[0.2em] bg-white rounded-[40px] border border-dashed">No sessions scheduled</div>}
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-5xl font-black tracking-tighter uppercase italic">Plans</h2>
               {isCoach && <button onClick={() => setEditingDailyPlan({})} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl">Create Blueprint</button>}
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {(dailyPlans || []).map(p => (
                 <div key={p.id} onClick={() => isCoach && setEditingDailyPlan(p)} className="bg-white p-8 rounded-[48px] border border-slate-100 group cursor-pointer hover:shadow-2xl transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6"><span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 py-1 rounded-full">{p.date}</span><span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{p.totalDuration}</span></div>
                    <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-4 uppercase leading-none">{p.title}</h3>
                    <div className="space-y-3 flex-1">
                       {(p.exercises || []).slice(0, 3).map((ex:any, i:number) => (
                         <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0"><span className="text-slate-600 font-bold">{ex.name}</span><span className="text-slate-400 font-medium">{ex.duration}</span></div>
                       ))}
                       {(p.exercises || []).length > 3 && <p className="text-[10px] text-blue-500 font-black mt-2">+ {(p.exercises || []).length - 3} more drills</p>}
                    </div>
                 </div>
               ))}
               {(dailyPlans || []).length === 0 && <div className="col-span-full p-12 text-center text-slate-300 font-black uppercase tracking-[0.2em] bg-white rounded-[40px] border border-dashed">No training plans available</div>}
            </div>
          </div>
        )}
      </main>

      {/* Modals & Detail Overlays */}
      {selectedStudent && <StudentDetail student={selectedStudent} tournaments={tournaments} onClose={() => setSelectedStudent(null)} onUpdate={updateStudent} role={user.role} onDelete={(id) => handleDeleteRecord('students', id, setStudents)} />}
      {selectedCoach && <CoachDetail coach={selectedCoach} canEdit={isCoach} onClose={() => setSelectedCoach(null)} onUpdate={updateCoach} onDelete={(id) => handleDeleteRecord('coaches', id, setCoaches)} />}
      {isAddingCoach && <CoachModal onClose={() => setIsAddingCoach(false)} onSave={(c) => { updateCoach(c); setIsAddingCoach(false); }} />}
      {selectedOfficer && <OfficerDetail officer={selectedOfficer} onClose={() => setSelectedOfficer(null)} canEdit={isCoach} onUpdate={updateOfficer} onDelete={(id) => handleDeleteRecord('officers', id, setOfficers)} />}
      {isAddingOfficer && <OfficerModal onClose={() => setIsAddingOfficer(false)} onSave={(o) => { updateOfficer(o); setIsAddingOfficer(false); }} />}
      {editingAnnouncement && <AnnouncementModal announcement={editingAnnouncement} onClose={() => setEditingAnnouncement(null)} onSave={(a) => handleUpdateRecord('announcements', a, setAnnouncements).then(() => setEditingAnnouncement(null))} onDelete={(id) => handleDeleteRecord('announcements', id, setAnnouncements)} isCoach={isCoach} />}
      {editingTournament && <TournamentModal tournament={editingTournament} onClose={() => setEditingTournament(null)} isCoach={isCoach} onSave={(t) => handleUpdateRecord('tournaments', t, setTournaments).then(() => setEditingTournament(null))} onDelete={(id) => handleDeleteRecord('tournaments', id, setTournaments)} />}
      {editingDailyPlan && <DailyPlanModal plan={editingDailyPlan} onClose={() => setEditingDailyPlan(null)} onSave={(p) => handleUpdateRecord('daily_plans', p, setDailyPlans).then(() => setEditingDailyPlan(null))} />}
      {editingSession && <SessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={(s) => handleUpdateRecord('sessions', s, setSessions).then(() => setEditingSession(null))} />}
      {showBrandingModal && <BrandingModal currentName={academyName} currentLogo={academyLogo} currentBanner={academyBanner} onClose={() => setShowBrandingModal(false)} onSave={(n, l, b) => { setAcademyName(n); setAcademyLogo(l); setAcademyBanner(b); setShowBrandingModal(false); }} />}

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[56px] w-full max-w-md shadow-3xl relative animate-in zoom-in">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-10 right-10 text-slate-400 font-black">CLOSE</button>
            <h3 className="text-4xl font-black mb-10 text-center uppercase">Coach Portal</h3>
            <form onSubmit={handleLogin} className="space-y-5">
              <input name="email" type="email" placeholder="COACH EMAIL" required className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[32px] font-black text-sm uppercase outline-none focus:border-blue-600" />
              <input name="password" type="password" placeholder="PASSWORD" required className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[32px] font-black text-sm uppercase outline-none focus:border-blue-600" />
              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black uppercase text-xs">Authorize Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;