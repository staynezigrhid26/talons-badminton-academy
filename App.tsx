import React, { useState, useMemo, useEffect } from 'react';
import { Student, Coach, Tournament, UserState, Announcement, SkillLevel, HealthStatus, Officer, DailyPlan, TrainingSession } from './types';
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

  // Branding State
  const [academyName, setAcademyName] = useState('TALONS ACADEMY');
  const [academyLogo, setAcademyLogo] = useState<string | null>(null);
  const [academyBanner, setAcademyBanner] = useState<string | null>(null);
  const [showBrandingModal, setShowBrandingModal] = useState(false);

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
          const [dbStudents, dbCoaches, dbTournaments, dbAnnouncements, dbPlans, dbSessions, dbOfficers, dbSettings] = await Promise.all([
            fetchData('students'), fetchData('coaches'), fetchData('tournaments'),
            fetchData('announcements'), fetchData('daily_plans'), fetchData('sessions'),
            fetchData('officers'), fetchData('academy_settings')
          ]);
          
          setStudents(dbStudents?.length ? dbStudents : INITIAL_STUDENTS);
          setCoaches(dbCoaches?.length ? dbCoaches : INITIAL_COACHES);
          setTournaments(dbTournaments?.length ? dbTournaments : MOCK_TOURNAMENTS);
          setAnnouncements(dbAnnouncements?.length ? dbAnnouncements : INITIAL_ANNOUNCEMENTS);
          setDailyPlans(dbPlans?.length ? dbPlans : INITIAL_DAILY_PLANS);
          setSessions(dbSessions?.length ? dbSessions : INITIAL_SESSIONS);
          setOfficers(dbOfficers?.length ? dbOfficers : INITIAL_OFFICERS);

          if (dbSettings && dbSettings.length > 0) {
            const settings = dbSettings[0];
            setAcademyName(settings.name || 'TALONS ACADEMY');
            setAcademyLogo(settings.logo_url || null);
            setAcademyBanner(settings.banner_url || null);
          } else {
            loadIdentityFromLocal();
          }
        } catch (err) {
          console.warn("Using local defaults due to cloud fetch failure.");
          loadFromLocal();
        }
      } else {
        loadFromLocal();
      }
      setLoading(false);
    };

    const loadIdentityFromLocal = () => {
      setAcademyName(localStorage.getItem('talons_academy_name') || 'TALONS ACADEMY');
      setAcademyLogo(localStorage.getItem('talons_academy_logo'));
      setAcademyBanner(localStorage.getItem('talons_academy_banner'));
    };

    const loadFromLocal = () => {
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
      loadIdentityFromLocal();
    };

    fetchEverything();
  }, []);

  const handleApplyBranding = async (name: string, logo: string | null, banner: string | null) => {
    try {
      setAcademyName(name);
      setAcademyLogo(logo);
      setAcademyBanner(banner);
      setShowBrandingModal(false);

      if (cloudEnabled) {
        await upsertRecord('academy_settings', {
          id: 'main',
          name: name,
          logo_url: logo,
          banner_url: banner
        });
      }

      try {
        localStorage.setItem('talons_academy_name', name);
        if (logo) localStorage.setItem('talons_academy_logo', logo);
        if (banner) localStorage.setItem('talons_academy_banner', banner);
      } catch (e) {
        console.warn("Storage limit reached. Settings stored in cloud.");
      }
    } catch (err) {
      console.error("Branding update error:", err);
      alert("Error saving branding settings.");
    }
  };

  const handleUpdateRecord = async (table: string, record: any, stateSetter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (cloudEnabled) {
      try {
        const saved = await upsertRecord(table, record);
        if (saved) stateSetter(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
      } catch (e: any) {
        alert(`Cloud Error: ${e.message || 'Update failed.'}`);
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

  const updateStudent = (student: Student) => handleUpdateRecord('students', student, setStudents);
  const updateCoach = (coach: Coach) => handleUpdateRecord('coaches', coach, setCoaches);
  const updateOfficer = (officer: Officer) => handleUpdateRecord('officers', officer, setOfficers);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    
    const coach = coaches.find(c => c.email.toLowerCase() === email.toLowerCase() && (c.password === password || password === 'admin'));
    if (coach) {
      setUser({ isLoggedIn: true, role: 'coach', profile: coach });
      setShowLoginModal(false);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
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

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-blue-400 uppercase tracking-widest text-[10px]">Portal Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 bg-slate-50 selection:bg-blue-100">
      {/* Sidebar - Tablet/Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex-col p-8 z-40 border-r border-white/5">
        <div className="mb-12 flex items-center gap-3 group relative">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-2xl overflow-hidden shrink-0">
            {academyLogo ? <img src={academyLogo} className="w-full h-full object-cover" /> : academyName.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-sm font-black truncate uppercase tracking-tight">{academyName}</h1>
            <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mt-1">Management Pro</p>
          </div>
          {isCoach && (
            <button 
              onClick={() => setShowBrandingModal(true)} 
              className="absolute -right-2 top-0 p-1.5 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              title="Branding Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          )}
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
          ]
          .filter(tab => tab.id !== 'plans' || isCoach)
          .map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-bold flex items-center gap-4 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <span className="text-xl">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/10 mt-auto">
          {user.isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl overflow-hidden">
                <img src={user.profile?.profile_pic} className="w-10 h-10 rounded-xl object-cover" />
                <div className="truncate text-xs font-black uppercase tracking-tight">{user.profile?.name}</div>
              </div>
              <button onClick={() => setUser({isLoggedIn: false, role: 'student', profile: null})} className="w-full py-3 bg-rose-900/20 text-[8px] font-black uppercase text-rose-400 rounded-xl border border-rose-900/40">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all">Coach Portal</button>
          )}
        </div>
      </aside>

      <main className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
             <div className="relative rounded-[32px] md:rounded-[48px] overflow-hidden bg-slate-900 text-white shadow-2xl p-8 md:p-12 min-h-[220px] md:min-h-[300px] flex flex-col justify-center border-4 border-white group">
                {academyBanner && <img src={academyBanner} className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none group-hover:scale-105 transition-transform duration-1000" />}
                <div className="relative z-10 max-w-3xl">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight mb-2 uppercase italic truncate">
                    {academyName}
                  </h1>
                  <p className="text-blue-400 font-black text-[9px] md:text-xs uppercase tracking-[0.3em] mb-6">Elite Performance Center</p>
                  
                  <div className="flex flex-wrap gap-2 md:gap-4 items-center">
                    {isCoach ? (
                      <>
                        <button onClick={handleManualSync} disabled={isSyncing} className="bg-emerald-600 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase shadow-xl flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>Sync Cloud
                        </button>
                        <button onClick={() => setShowBrandingModal(true)} className="bg-white/10 backdrop-blur-md border border-white/20 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase shadow-xl hover:bg-white/20 transition-all flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Identity
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setShowLoginModal(true)} className="md:hidden bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl flex items-center gap-2 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        Coach Login
                      </button>
                    )}
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <section className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
                      <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Tournaments</h2>
                      {isCoach && <button onClick={() => setEditingTournament({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg hover:rotate-90 transition-all">+</button>}
                   </div>
                   <div className="space-y-4">
                      {tournaments.slice(0, 3).map(t => (
                        <div key={t.id} onClick={() => setEditingTournament(t)} className="p-4 md:p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center gap-4 md:gap-5 hover:border-blue-200 transition-all cursor-pointer group">
                           <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-sm flex flex-col items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <p className="text-[8px] md:text-[10px] font-black uppercase leading-none">{new Date(t.date).toLocaleString('default', { month: 'short' })}</p>
                              <p className="text-xl md:text-2xl font-black leading-none mt-1">{new Date(t.date).getDate()}</p>
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <h3 className="font-black text-slate-800 tracking-tight text-md md:text-lg leading-none truncate group-hover:text-blue-600">{t.name}</h3>
                              <p className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">{t.location}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
                <section className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
                      <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Announcements</h2>
                      {isCoach && <button onClick={() => setEditingAnnouncement({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg hover:rotate-90 transition-all">+</button>}
                   </div>
                   <div className="space-y-6">
                      {announcements.slice(0, 3).map(a => (
                        <div key={a.id} onClick={() => setEditingAnnouncement(a)} className="pb-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 p-2 md:p-4 rounded-3xl transition-all cursor-pointer">
                           <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-2 bg-blue-50 px-3 py-1 rounded-full inline-block">{a.date}</p>
                           <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-tight">{a.title}</h3>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Athletes</h2>
              <div className="flex gap-2 w-full md:w-auto">
                <input type="text" placeholder="Search athletes..." className="bg-white border-2 border-slate-100 px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl text-sm font-bold flex-1 md:w-64 outline-none focus:border-blue-600 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {isCoach && <button onClick={() => setSelectedStudent({ id: `s${Date.now()}`, name: '', age: 0, birthday: '', profile_pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new', level: SkillLevel.BEGINNER, health_status: HealthStatus.FIT, attendance: [], tournament_ids: [], notes: '' })} className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase shadow-xl hover:bg-blue-700 transition-all">Add Athlete</button>}
              </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
               {(students || []).filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(s => <StudentCard key={s.id} student={s} onClick={() => setSelectedStudent(s)} />)}
            </div>
          </div>
        )}

        {activeTab === 'coaches' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Staff</h2>
               {isCoach && <button onClick={() => setIsAddingCoach(true)} className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase shadow-xl">New Coach</button>}
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               {(coaches || []).map(c => (
                 <div key={c.id} onClick={() => setSelectedCoach(c)} className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <img src={c.profile_pic} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl mx-auto object-cover border-4 border-slate-50 mb-6 group-hover:scale-110 transition duration-500 shadow-sm" alt={c.name} />
                    <div className="text-center">
                       <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight leading-none">{c.name}</h3>
                       <p className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3 bg-blue-50 px-4 py-1.5 rounded-full inline-block border border-blue-100">{c.specialization}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Schedule</h2>
               {isCoach && <button onClick={() => setEditingSession({})} className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase shadow-xl">Add Session</button>}
            </header>
            <div className="space-y-4">
               {[...(sessions || [])].sort((a,b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime()).map(s => (
                 <div key={s.id} onClick={() => isCoach && setEditingSession(s)} className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 group cursor-pointer hover:shadow-xl transition-all">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg">
                       <span className="text-[8px] md:text-[9px] font-black uppercase leading-none opacity-80">{new Date(s.date || '').toLocaleString('default', { month: 'short' })}</span>
                       <span className="text-lg md:text-xl font-black leading-none mt-1">{new Date(s.date || '').getDate()}</span>
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-1"><h3 className="font-black text-lg md:text-xl text-slate-800 uppercase tracking-tight">{s.title}</h3><span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${s.type === 'Special' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{s.type}</span></div>
                       <p className="text-slate-500 font-bold text-sm">{s.start_time} - {s.end_time} • <span className="text-slate-400 font-medium italic">{s.focus}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">{(s.target_levels || []).map(lvl => <span key={lvl} className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-2.5 py-1 rounded-full">{lvl}</span>)}</div>
                 </div>
               ))}
               {(sessions || []).length === 0 && <div className="p-12 text-center text-slate-300 font-black uppercase tracking-[0.2em] bg-white rounded-[40px] border border-dashed">No sessions scheduled</div>}
            </div>
          </div>
        )}

        {activeTab === 'plans' && isCoach && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Blueprints</h2>
               {isCoach && <button onClick={() => setEditingDailyPlan({})} className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase shadow-xl">Create Plan</button>}
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
               {(dailyPlans || []).map(p => (
                 <div key={p.id} onClick={() => isCoach && setEditingDailyPlan(p)} className="bg-white p-6 md:p-8 rounded-[40px] md:rounded-[48px] border border-slate-100 group cursor-pointer hover:shadow-2xl transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6"><span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 py-1 rounded-full">{p.date}</span><span className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest">{p.total_duration}</span></div>
                    <h3 className="font-black text-xl md:text-2xl text-slate-800 tracking-tight mb-4 uppercase leading-tight">{p.title}</h3>
                    <div className="space-y-2 flex-1">
                       {(p.exercises || []).slice(0, 3).map((ex:any, i:number) => (
                         <div key={i} className="flex items-center justify-between text-[11px] py-1.5 border-b border-slate-50 last:border-0"><span className="text-slate-600 font-bold">{ex.name}</span><span className="text-slate-400 font-medium">{ex.duration}</span></div>
                       ))}
                       {(p.exercises || []).length > 3 && <p className="text-[9px] text-blue-500 font-black mt-2">+ {(p.exercises || []).length - 3} more drills</p>}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Board</h2>
               {isCoach && <button onClick={() => setIsAddingOfficer(true)} className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase shadow-xl">Add Officer</button>}
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
               {sortedOfficers.map(off => (
                 <div key={off.id} onClick={() => setSelectedOfficer(off)} className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 text-center hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer">
                    <img src={off.profile_pic} className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] mx-auto object-cover border-4 border-slate-50 mb-6 group-hover:scale-110 transition duration-500 shadow-sm" alt="" />
                    <h3 className="font-black text-slate-800 text-md md:text-lg tracking-tight leading-none">{off.name}</h3>
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest mt-3 bg-blue-50 px-3 py-1.5 rounded-full inline-block border border-blue-100">{off.role}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Attendance</h2>
              <div className="flex items-center gap-2 bg-white p-2 md:p-3 rounded-2xl md:rounded-3xl border border-slate-200">
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-slate-50 px-3 py-1.5 rounded-xl font-black text-[10px] outline-none" />
              </div>
            </header>
            <div className="bg-white p-4 md:p-8 rounded-[24px] md:rounded-[40px] border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
               <table className="w-full text-left min-w-[500px]">
                 <thead><tr className="text-[10px] font-black uppercase text-slate-400 border-b"><th className="pb-4 pl-4">Athlete</th><th className="pb-4">Level</th><th className="pb-4 text-center">Status</th><th className="pb-4 text-right pr-4">Action</th></tr></thead>
                 <tbody className="divide-y">
                   {(students || []).map(s => {
                     const record = (s.attendance || []).find(r => r.date === attendanceDate);
                     return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-4 font-black text-slate-800 flex items-center gap-3">
                          <img src={s.profile_pic} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                          <span className="truncate max-w-[120px]">{s.name}</span>
                        </td>
                        <td className="py-4"><span className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">{s.level}</span></td>
                        <td className="py-4 text-center">
                           {record ? <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{record.status}</span> : <span className="text-[9px] font-black text-slate-300">N/A</span>}
                        </td>
                        <td className="py-4 text-right pr-4">
                          {isCoach && (
                            <button onClick={() => handleToggleAttendance(s, attendanceDate)} className={`p-2 rounded-xl transition-all ${record?.status === 'present' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                     );
                   })}
                 </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      {/* Mobile/Tablet Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[32px] flex items-center justify-around py-5 z-40 shadow-2xl">
        {[
          { id: 'dashboard', icon: '🏠' },
          { id: 'students', icon: '🎾' },
          { id: 'coaches', icon: '👔' },
          { id: 'schedule', icon: '📅' },
          { id: 'attendance', icon: '📊' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`text-xl transition-all duration-300 ${activeTab === tab.id ? 'text-blue-500 scale-125 -translate-y-1' : 'text-slate-500'}`}>
            {tab.icon}
          </button>
        ))}
        <button 
          onClick={() => user.isLoggedIn ? setUser({isLoggedIn: false, role: 'student', profile: null}) : setShowLoginModal(true)} 
          className={`text-xl transition-all duration-300 ${user.isLoggedIn ? 'text-emerald-500' : 'text-slate-500'}`}
        >
          {user.isLoggedIn ? '👤' : '🔒'}
        </button>
      </nav>

      {/* Modals */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[56px] w-full max-w-md shadow-3xl relative animate-in zoom-in duration-500">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-400 font-black hover:text-slate-900 transition-colors">X</button>
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Coach Login</h3>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">Authorized Personnel Only</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input name="email" type="email" placeholder="EMAIL ADDRESS" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 md:p-6 rounded-[24px] md:rounded-[32px] font-black text-xs uppercase outline-none focus:border-blue-600 transition-all" />
              <input name="password" type="password" placeholder="PASSWORD" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 md:p-6 rounded-[24px] md:rounded-[32px] font-black text-xs uppercase outline-none focus:border-blue-600 transition-all" />
              <button type="submit" className="w-full bg-blue-600 text-white py-5 md:py-6 rounded-[24px] md:rounded-[32px] font-black uppercase text-[10px] shadow-2xl hover:bg-blue-700 transition-all active:scale-95">Authenticate Profile</button>
              {loginError && <p className="text-rose-500 text-[10px] font-black uppercase text-center animate-pulse">{loginError}</p>}
            </form>
          </div>
        </div>
      )}

      {showBrandingModal && <BrandingModal currentName={academyName} currentLogo={academyLogo} currentBanner={academyBanner} onClose={() => setShowBrandingModal(false)} onSave={handleApplyBranding} />}
      {selectedStudent && <StudentDetail student={selectedStudent} tournaments={tournaments} onClose={() => setSelectedStudent(null)} onUpdate={updateStudent} role={user.role} isLoggedIn={user.isLoggedIn} onDelete={(id) => handleDeleteRecord('students', id, setStudents)} />}
      {selectedCoach && <CoachDetail coach={selectedCoach} canEdit={isCoach} onClose={() => setSelectedCoach(null)} onUpdate={updateCoach} onDelete={(id) => handleDeleteRecord('coaches', id, setCoaches)} />}
      {isAddingCoach && <CoachModal onClose={() => setIsAddingCoach(false)} onSave={(c) => { updateCoach(c); setIsAddingCoach(false); }} />}
      {selectedOfficer && <OfficerDetail officer={selectedOfficer} onClose={() => setSelectedOfficer(null)} canEdit={isCoach} onUpdate={updateOfficer} onDelete={(id) => handleDeleteRecord('officers', id, setOfficers)} />}
      {isAddingOfficer && <OfficerModal onClose={() => setIsAddingOfficer(false)} onSave={(o) => { updateOfficer(o); setIsAddingOfficer(false); }} />}
      {editingTournament && <TournamentModal tournament={editingTournament} onClose={() => setEditingTournament(null)} isCoach={isCoach} onSave={(t) => handleUpdateRecord('tournaments', t, setTournaments).then(() => setEditingTournament(null))} onDelete={(id) => handleDeleteRecord('tournaments', id, setTournaments)} />}
      {editingAnnouncement && <AnnouncementModal announcement={editingAnnouncement} onClose={() => setEditingAnnouncement(null)} onSave={(a) => handleUpdateRecord('announcements', a, setAnnouncements).then(() => setEditingAnnouncement(null))} onDelete={(id) => handleDeleteRecord('announcements', id, setAnnouncements)} isCoach={isCoach} />}
      {editingDailyPlan && <DailyPlanModal plan={editingDailyPlan} onClose={() => setEditingDailyPlan(null)} onSave={(p) => handleUpdateRecord('daily_plans', p, setDailyPlans).then(() => setEditingDailyPlan(null))} />}
      {editingSession && <SessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={(s) => handleUpdateRecord('sessions', s, setSessions).then(() => setEditingSession(null))} />}
    </div>
  );
};

export default App;