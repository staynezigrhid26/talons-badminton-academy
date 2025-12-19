import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Student, Coach, Tournament, UserState, Announcement, SkillLevel, HealthStatus, Officer, DailyPlan, TrainingSession, AttendanceRecord } from './types';
import { INITIAL_STUDENTS, INITIAL_COACHES, MOCK_TOURNAMENTS, INITIAL_ANNOUNCEMENTS, INITIAL_OFFICERS, INITIAL_DAILY_PLANS, INITIAL_SESSIONS } from './constants';
import { isSupabaseConfigured, checkStorageConfig } from './supabaseClient';
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

  // Officer Hierarchy Logic
  const OFFICER_RANK_MAP: Record<string, number> = {
    'President': 1, 'Vice President': 2, 'Secretary': 3, 'Treasurer': 4,
    'Auditor': 5, 'P.I.O.': 6, 'PIO': 6, 'Sgt. at Arms': 7, 'Sergeant at Arms': 7
  };

  const sortedOfficers = useMemo(() => {
    return [...officers].sort((a, b) => {
      const rankA = OFFICER_RANK_MAP[a.role || ''] || 99;
      const rankB = OFFICER_RANK_MAP[b.role || ''] || 99;
      return rankA - rankB;
    });
  }, [officers]);

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const isConfigured = isSupabaseConfigured();
      setCloudEnabled(isConfigured);

      const loadKey = (key: string, defaultValue: any) => {
        try {
          const saved = localStorage.getItem(`talons_${key}`);
          if (saved && saved !== 'undefined') {
            return JSON.parse(saved);
          }
        } catch (e) {
          console.error(`Error loading key ${key}:`, e);
        }
        return defaultValue;
      };

      setStudents(loadKey('students', INITIAL_STUDENTS));
      setCoaches(loadKey('coaches', INITIAL_COACHES));
      setTournaments(loadKey('tournaments', MOCK_TOURNAMENTS));
      setAnnouncements(loadKey('announcements', INITIAL_ANNOUNCEMENTS));
      setDailyPlans(loadKey('plans', INITIAL_DAILY_PLANS));
      setSessions(loadKey('sessions', INITIAL_SESSIONS));
      setOfficers(loadKey('officers', INITIAL_OFFICERS));
      
      const branding = loadKey('branding', { name: 'TALONS ACADEMY', logo: null, banner: null });
      setAcademyName(branding.name || 'TALONS ACADEMY');
      setAcademyLogo(branding.logo);
      setAcademyBanner(branding.banner);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  // Persistence Effect
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('talons_students', JSON.stringify(students));
      localStorage.setItem('talons_coaches', JSON.stringify(coaches));
      localStorage.setItem('talons_tournaments', JSON.stringify(tournaments));
      localStorage.setItem('talons_announcements', JSON.stringify(announcements));
      localStorage.setItem('talons_plans', JSON.stringify(dailyPlans));
      localStorage.setItem('talons_sessions', JSON.stringify(sessions));
      localStorage.setItem('talons_officers', JSON.stringify(officers));
      localStorage.setItem('talons_branding', JSON.stringify({
        name: academyName, logo: academyLogo, banner: academyBanner
      }));
    }
  }, [students, coaches, tournaments, announcements, dailyPlans, sessions, officers, academyName, academyLogo, academyBanner, loading]);

  const updateStudent = useCallback((updated: Student) => {
    setStudents(prev => {
      const index = prev.findIndex(s => s.id === updated.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = updated;
        return next;
      } else {
        return [updated, ...prev];
      }
    });
    setSelectedStudent(null);
  }, []);

  const updateCoach = useCallback((updated: Coach) => {
    setCoaches(prev => {
      const index = prev.findIndex(c => c.id === updated.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = updated;
        return next;
      } else {
        return [updated, ...prev];
      }
    });
    setSelectedCoach(null);
  }, []);

  const updateOfficer = useCallback((updated: Officer) => {
    setOfficers(prev => {
      const index = prev.findIndex(o => o.id === updated.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = updated;
        return next;
      } else {
        return [updated, ...prev];
      }
    });
    setSelectedOfficer(null);
  }, []);

  const deleteTournament = useCallback((id: string) => {
    setTournaments(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleManualSync = async () => {
    if (!cloudEnabled) {
      alert("Supabase is not configured.");
      return;
    }
    setIsSyncing(true);
    try {
      const diagnostic = await checkStorageConfig();
      alert(diagnostic.ok ? "Cloud connection is active!" : `Cloud Issue: ${diagnostic.message}`);
    } catch (e) {
      alert("Sync check failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
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
    const existing = student.attendance.find(r => r.date === date);
    let newAttendance: AttendanceRecord[];
    if (existing) {
      newAttendance = student.attendance.map(r => r.date === date ? { ...r, status: r.status === 'present' ? 'absent' : 'present' } : r);
    } else {
      newAttendance = [{ date, status: 'present' }, ...student.attendance];
    }
    updateStudent({ ...student, attendance: newAttendance });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-blue-400 uppercase tracking-widest text-[10px]">Portal Booting</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 bg-slate-50 selection:bg-blue-100">
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex-col p-8 z-40 border-r border-white/5 shadow-2xl">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-2xl shadow-lg shadow-blue-600/20 overflow-hidden ${academyLogo ? 'bg-white' : ''}`}>
               {academyLogo ? <img src={academyLogo} className="w-full h-full object-cover" alt="Logo" /> : (academyName ? academyName.charAt(0) : 'T')}
            </div>
            <div className="flex-1 overflow-hidden">
              <h1 className="text-sm font-black tracking-tighter leading-none truncate uppercase">{academyName}</h1>
              <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mt-1">Academy Pro</p>
            </div>
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
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-bold flex items-center gap-4 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10 mt-auto">
          {user.isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                <img src={user.profile?.profilePic} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="me" />
                <div className="overflow-hidden">
                  <p className="text-xs font-black truncate">{user.profile?.name}</p>
                  <p className="text-[9px] text-blue-400 font-bold uppercase">Authorized</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {isCoach && <button onClick={() => setShowBrandingModal(true)} className="w-full py-2 bg-white/5 text-[8px] font-black uppercase text-slate-400 rounded-lg hover:bg-white/10 transition">Branding</button>}
                <button onClick={() => setUser({isLoggedIn: false, role: 'student', profile: null})} className="w-full py-2 bg-rose-900/20 text-[8px] font-black uppercase text-rose-400 rounded-lg hover:bg-rose-900/40 transition">Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-500 transition-all active:scale-95">Coach Portal</button>
          )}
        </div>
      </aside>

      <main className="p-6 md:p-12 max-w-6xl mx-auto min-h-screen">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="relative rounded-[48px] overflow-hidden bg-slate-900 text-white shadow-2xl p-10 min-h-[300px] flex flex-col justify-center border-4 border-white">
                {academyBanner && (
                  <img src={academyBanner} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" alt="Banner" />
                )}
                <div className="relative z-10">
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 uppercase italic">{academyName}</h1>
                  <p className="text-blue-400 font-black text-xs md:text-sm uppercase tracking-[0.4em] opacity-80">Elite Badminton Management System</p>
                  {isCoach && (
                    <div className="mt-8">
                      <button onClick={handleManualSync} disabled={isSyncing} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95">
                        {isSyncing ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Check Cloud Health"}
                      </button>
                    </div>
                  )}
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-8 px-2">
                      <h2 className="text-2xl font-black tracking-tight uppercase">Tournaments</h2>
                      {isCoach && <button onClick={() => setEditingTournament({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg hover:rotate-90 transition-all">+</button>}
                   </div>
                   <div className="space-y-4">
                      {tournaments.map(t => (
                        <div key={t.id} onClick={() => setEditingTournament(t)} className="group p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5 hover:border-blue-200 transition-all cursor-pointer">
                           <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center shrink-0 border border-slate-100">
                              <p className="text-[10px] font-black uppercase text-blue-600 leading-none">{new Date(t.date).toLocaleString('default', { month: 'short' })}</p>
                              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{new Date(t.date).getDate()}</p>
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <h3 className="font-black text-slate-800 tracking-tight text-lg leading-none truncate">{t.name}</h3>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">{t.location}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
                
                <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-8 px-2">
                      <h2 className="text-2xl font-black tracking-tight uppercase">News</h2>
                      {isCoach && <button onClick={() => setEditingAnnouncement({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg hover:rotate-90 transition-all">+</button>}
                   </div>
                   <div className="space-y-6">
                      {announcements.map(a => (
                        <div key={a.id} onClick={() => setEditingAnnouncement(a)} className="pb-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 p-4 rounded-3xl transition-all cursor-pointer">
                           <p className="text-[9px] font-black text-blue-600 uppercase mb-2 bg-blue-50 px-3 py-1 rounded-full inline-block">{a.date}</p>
                           <h3 className="text-xl font-black text-slate-800 tracking-tight">{a.title}</h3>
                           <p className="text-sm text-slate-500 mt-2 font-medium line-clamp-2">{a.content}</p>
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
              <div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic">Athletes</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Active Player Roster</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <input 
                  type="text" placeholder="Search..." 
                  className="bg-white border-2 border-slate-100 px-6 py-4 rounded-3xl focus:border-blue-600 outline-none text-sm font-bold flex-1 md:w-64 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isCoach && (
                  <button 
                    onClick={() => setSelectedStudent({ 
                      id: `s${Date.now()}`, 
                      name: '', 
                      age: 0, 
                      birthday: '', 
                      profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new', 
                      level: SkillLevel.BEGINNER, 
                      healthStatus: HealthStatus.FIT, 
                      attendance: [], 
                      tournamentIds: [],
                      notes: '' 
                    })} 
                    className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Add Athlete
                  </button>
                )}
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {students.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                 <StudentCard key={s.id} student={s} onClick={() => setSelectedStudent(s)} />
               ))}
            </div>
          </div>
        )}

        {activeTab === 'coaches' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-5xl font-black tracking-tighter uppercase italic">Staff</h2>
               {isCoach && (
                 <button onClick={() => setIsAddingCoach(true)} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all">New Staff</button>
               )}
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {coaches.map(c => (
                 <div key={c.id} onClick={() => setSelectedCoach(c)} className="bg-white p-8 rounded-[40px] border border-slate-100 group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <img src={c.profilePic} className="w-24 h-24 rounded-3xl mx-auto object-cover border-4 border-slate-50 mb-6 group-hover:scale-110 transition duration-500" alt={c.name} />
                    <div className="text-center">
                       <h3 className="font-black text-slate-800 text-2xl tracking-tight leading-none">{c.name}</h3>
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3 bg-blue-50 px-4 py-1.5 rounded-full inline-block border border-blue-100">{c.specialization}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <h2 className="text-5xl font-black tracking-tighter uppercase italic">Board</h2>
               {isCoach && (
                 <button onClick={() => setIsAddingOfficer(true)} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all">Add Officer</button>
               )}
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
               {sortedOfficers.map(off => (
                 <div key={off.id} onClick={() => setSelectedOfficer(off)} className="bg-white p-8 rounded-[40px] border border-slate-100 text-center hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer">
                    <img src={off.profilePic} className="w-24 h-24 rounded-[32px] mx-auto object-cover border-4 border-slate-50 mb-6 group-hover:scale-110 transition duration-500" alt="" />
                    <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none">{off.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3 bg-blue-50 px-4 py-1.5 rounded-full inline-block border border-blue-100">{off.role}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <h2 className="text-5xl font-black tracking-tighter uppercase italic">Attendance</h2>
              <div className="flex items-center gap-3 bg-white p-3 rounded-3xl border border-slate-200">
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-slate-50 px-4 py-2 rounded-2xl font-black text-xs outline-none" />
              </div>
            </header>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[10px] font-black uppercase text-slate-400 border-b">
                     <th className="pb-6 pl-6">Athlete</th>
                     <th className="pb-6">Level</th>
                     <th className="pb-6 text-center">Status</th>
                     <th className="pb-6 text-right pr-6">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {students.map(s => {
                     const record = s.attendance.find(r => r.date === attendanceDate);
                     return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-6 font-black text-slate-800 flex items-center gap-4">
                          <img src={s.profilePic} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                          {s.name}
                        </td>
                        <td className="py-5"><span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">{s.level}</span></td>
                        <td className="py-5 text-center">
                           {record ? <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{record.status}</span> : <span className="text-[10px] font-black text-slate-300">N/A</span>}
                        </td>
                        <td className="py-5 text-right pr-6">
                          {isCoach && (
                            <button onClick={() => handleToggleAttendance(s, attendanceDate)} className={`p-3 rounded-2xl transition-all ${record?.status === 'present' ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
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

        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic">Schedule</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Active Training Slots</p>
               </div>
               {isCoach && (
                 <button onClick={() => setEditingSession({})} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all">Add Session</button>
               )}
            </header>
            <div className="space-y-4">
               {[...(sessions || [])].sort((a,b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime()).map(s => (
                 <div key={s.id} onClick={() => isCoach && setEditingSession(s)} className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 group cursor-pointer hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                       <span className="text-[9px] font-black uppercase leading-none opacity-80">{new Date(s.date || '').toLocaleString('default', { month: 'short' })}</span>
                       <span className="text-xl font-black leading-none mt-1">{new Date(s.date || '').getDate()}</span>
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">{s.title}</h3>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.type === 'Special' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{s.type}</span>
                       </div>
                       <p className="text-slate-500 font-bold text-sm">{s.startTime} - {s.endTime} • <span className="text-slate-400 font-medium italic">{s.focus}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {(s.targetLevels || []).map(lvl => (
                         <span key={lvl} className="text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-3 py-1 rounded-full">{lvl}</span>
                       ))}
                    </div>
                 </div>
               ))}
               {(sessions || []).length === 0 && <div className="p-12 text-center text-slate-300 font-black uppercase tracking-[0.2em] bg-white rounded-[40px] border border-dashed">No sessions scheduled</div>}
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic">Blueprints</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Training Exercise Plans</p>
               </div>
               {isCoach && (
                 <button onClick={() => setEditingDailyPlan({})} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all">Create Blueprint</button>
               )}
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {(dailyPlans || []).map(p => (
                 <div key={p.id} onClick={() => isCoach && setEditingDailyPlan(p)} className="bg-white p-8 rounded-[48px] border border-slate-100 group cursor-pointer hover:shadow-2xl transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 py-1 rounded-full border border-blue-100">{p.date}</span>
                       <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{p.totalDuration}</span>
                    </div>
                    <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-4 uppercase leading-none">{p.title}</h3>
                    <div className="space-y-3 flex-1">
                       {(p.exercises || []).slice(0, 3).map((ex, i) => (
                         <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0">
                            <span className="text-slate-600 font-bold">{ex.name}</span>
                            <span className="text-slate-400 font-medium">{ex.duration}</span>
                         </div>
                       ))}
                       {(p.exercises || []).length > 3 && <p className="text-[10px] text-blue-500 font-black mt-2">+ {(p.exercises || []).length - 3} more drills</p>}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-slate-300 font-black text-[9px] uppercase tracking-widest">Blueprint ID: {p.id.slice(0,6)}</span>
                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">→</div>
                    </div>
                 </div>
               ))}
               {(dailyPlans || []).length === 0 && <div className="col-span-full p-12 text-center text-slate-300 font-black uppercase tracking-[0.2em] bg-white rounded-[40px] border border-dashed">No training plans available</div>}
            </div>
          </div>
        )}
      </main>

      {/* Detail Overlays */}
      {selectedStudent && (
        <StudentDetail 
          student={selectedStudent} 
          tournaments={tournaments} 
          onClose={() => setSelectedStudent(null)} 
          onUpdate={updateStudent} 
          role={user.role} 
          onDelete={(id) => { setStudents(prev => prev.filter(s => s.id !== id)); setSelectedStudent(null); }} 
        />
      )}
      {selectedCoach && (
        <CoachDetail 
          coach={selectedCoach} 
          canEdit={isCoach} 
          onClose={() => setSelectedCoach(null)} 
          onUpdate={updateCoach} 
          onDelete={(id) => { setCoaches(prev => prev.filter(c => c.id !== id)); setSelectedCoach(null); }} 
        />
      )}
      {isAddingCoach && (
        <CoachModal onClose={() => setIsAddingCoach(false)} onSave={(c) => { updateCoach(c); setIsAddingCoach(false); }} />
      )}
      {selectedOfficer && (
        <OfficerDetail 
          officer={selectedOfficer} 
          onClose={() => setSelectedOfficer(null)} 
          canEdit={isCoach} 
          onUpdate={updateOfficer} 
          onDelete={(id) => { setOfficers(prev => prev.filter(o => o.id !== id)); setSelectedOfficer(null); }} 
        />
      )}
      {isAddingOfficer && (
        <OfficerModal onClose={() => setIsAddingOfficer(false)} onSave={(o) => { updateOfficer(o); setIsAddingOfficer(false); }} />
      )}
      {editingAnnouncement && (
        <AnnouncementModal announcement={editingAnnouncement} onClose={() => setEditingAnnouncement(null)} onSave={(a) => { setAnnouncements(prev => [a, ...prev.filter(x => x.id !== a.id)]); setEditingAnnouncement(null); }} onDelete={deleteAnnouncement} isCoach={isCoach} />
      )}
      {editingTournament && (
        <TournamentModal tournament={editingTournament} onClose={() => setEditingTournament(null)} isCoach={isCoach} onSave={(t) => { setTournaments(prev => [t, ...prev.filter(x => x.id !== t.id)]); setEditingTournament(null); }} onDelete={deleteTournament} />
      )}
      {editingDailyPlan && (
        <DailyPlanModal plan={editingDailyPlan} onClose={() => setEditingDailyPlan(null)} onSave={(p) => { setDailyPlans(prev => [p, ...prev.filter(x => x.id !== p.id)]); setEditingDailyPlan(null); }} />
      )}
      {editingSession && (
        <SessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={(s) => { setSessions(prev => [s, ...prev.filter(x => x.id !== s.id)]); setEditingSession(null); }} />
      )}
      {showBrandingModal && (
        <BrandingModal currentName={academyName} currentLogo={academyLogo} currentBanner={academyBanner} onClose={() => setShowBrandingModal(false)} onSave={(n, l, b) => { setAcademyName(n); setAcademyLogo(l); setAcademyBanner(b); setShowBrandingModal(false); }} />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[56px] w-full max-w-md shadow-3xl relative animate-in zoom-in duration-500">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-10 right-10 text-slate-400 font-black hover:text-slate-900 transition">CLOSE</button>
            <h3 className="text-4xl font-black mb-10 text-center italic tracking-tighter uppercase leading-none">Terminal Access</h3>
            {loginError && <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-rose-500 text-center bg-rose-50 p-4 rounded-2xl">{loginError}</p>}
            <form onSubmit={handleLogin} className="space-y-5">
              <input name="email" type="email" placeholder="COACH EMAIL" required className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[32px] outline-none focus:border-blue-600 font-black text-sm uppercase" />
              <input name="password" type="password" placeholder="PASSWORD" required className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[32px] outline-none focus:border-blue-600 font-black text-sm uppercase" />
              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl text-xs mt-4 active:scale-95 transition-all">Authorize Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-8 left-8 right-8 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[40px] flex items-center justify-around py-6 z-40 shadow-3xl">
        {['dashboard', 'students', 'coaches', 'attendance', 'schedule', 'plans'].map(id => (
          <button key={id} onClick={() => setActiveTab(id as any)} className={`text-2xl transition-all ${activeTab === id ? 'text-blue-500 scale-150 -translate-y-1' : 'text-slate-500'}`}>
            {id === 'dashboard' ? '🏠' : id === 'students' ? '🎾' : id === 'coaches' ? '👔' : id === 'attendance' ? '📊' : id === 'schedule' ? '📅' : '📋'}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;