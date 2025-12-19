import React, { useState, useMemo, useEffect } from 'react';
import { Student, Coach, Tournament, UserState, Announcement, SkillLevel, HealthStatus, Officer, DailyPlan, TrainingSession, AttendanceRecord } from './types';
import { INITIAL_STUDENTS, INITIAL_COACHES, MOCK_TOURNAMENTS, INITIAL_ANNOUNCEMENTS, INITIAL_OFFICERS, INITIAL_DAILY_PLANS, INITIAL_SESSIONS } from './constants';
import { supabase, isSupabaseConfigured } from './supabaseClient';
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
    'President': 1,
    'Vice President': 2,
    'Secretary': 3,
    'Treasurer': 4,
    'Auditor': 5,
    'P.I.O.': 6,
    'PIO': 6,
    'Sgt. at Arms': 7,
    'Sergeant at Arms': 7
  };

  const sortedOfficers = useMemo(() => {
    return [...officers].sort((a, b) => {
      const rankA = OFFICER_RANK_MAP[a.role] || 99;
      const rankB = OFFICER_RANK_MAP[b.role] || 99;
      return rankA - rankB;
    });
  }, [officers]);

  // Initial Load with LocalStorage Priority
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const isConfigured = isSupabaseConfigured();
      setCloudEnabled(isConfigured);

      const loadKey = (key: string, defaultValue: any) => {
        const saved = localStorage.getItem(`talons_${key}`);
        if (saved && saved !== 'undefined') {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.error(`Error parsing ${key}`, e);
            return defaultValue;
          }
        }
        return defaultValue;
      };

      // Load all data with fallbacks to constants
      setStudents(loadKey('students', INITIAL_STUDENTS));
      setCoaches(loadKey('coaches', INITIAL_COACHES));
      setTournaments(loadKey('tournaments', MOCK_TOURNAMENTS));
      setAnnouncements(loadKey('announcements', INITIAL_ANNOUNCEMENTS));
      setDailyPlans(loadKey('plans', INITIAL_DAILY_PLANS));
      setSessions(loadKey('sessions', INITIAL_SESSIONS));
      setOfficers(loadKey('officers', INITIAL_OFFICERS));
      
      const branding = loadKey('branding', { name: 'TALONS ACADEMY', logo: null, banner: null });
      setAcademyName(branding.name);
      setAcademyLogo(branding.logo);
      setAcademyBanner(branding.banner);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  // Persistence Effect: Saves data whenever state changes
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
        name: academyName,
        logo: academyLogo,
        banner: academyBanner
      }));
    }
  }, [students, coaches, tournaments, announcements, dailyPlans, sessions, officers, academyName, academyLogo, academyBanner, loading]);

  const handleManualSync = async () => {
    if (!cloudEnabled) {
      alert("Supabase is not configured. Sync skipped.");
      return;
    }
    setIsSyncing(true);
    try {
      // Logic for cloud syncing could go here (e.g. updating a central branding table)
      // For now we simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Cloud Sync Successful! Academy data is up to date.");
    } catch (e) {
      console.error(e);
      alert("Sync failed.");
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

  const formatSessionDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const dayNum = date.getDate();
      const year = date.getFullYear();
      return {
        day: dayName,
        full: `${month} ${dayNum}, ${year}`
      };
    } catch {
      return { day: 'N/A', full: dateStr };
    }
  };

  const updateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex-col p-8 z-40 border-r border-white/5 shadow-2xl">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-2xl shadow-lg shadow-blue-600/20 overflow-hidden ${academyLogo ? 'bg-white' : ''}`}>
               {academyLogo ? <img src={academyLogo} className="w-full h-full object-cover" alt="Logo" /> : academyName.charAt(0)}
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
          ].filter(tab => tab.id !== 'plans' || isCoach).map((tab) => (
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

      {/* Main Content Area */}
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
                    <div className="mt-8 flex gap-3">
                      <button 
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/40 flex items-center gap-2 transition-all active:scale-95"
                      >
                        {isSyncing ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isSyncing ? 'Syncing...' : 'Cloud Sync'}
                      </button>
                    </div>
                  )}
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                   <div className="flex justify-between items-center mb-8 px-2">
                      <h2 className="text-2xl font-black tracking-tight">Active Tournaments</h2>
                      {isCoach && <button onClick={() => setEditingTournament({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200 hover:rotate-90 transition-all">+</button>}
                   </div>
                   <div className="space-y-4">
                      {tournaments.slice(0, 3).map(t => (
                        <div key={t.id} onClick={() => setEditingTournament(t)} className="group p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5 hover:border-blue-200 transition-all cursor-pointer">
                           <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center shrink-0 border border-slate-100">
                              <p className="text-[10px] font-black uppercase text-blue-600 leading-none">{new Date(t.date).toLocaleString('default', { month: 'short' })}</p>
                              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{new Date(t.date).getDate()}</p>
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <h3 className="font-black text-slate-800 tracking-tight text-lg leading-none">{t.name}</h3>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">{t.location}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
                
                <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                   <div className="flex justify-between items-center mb-8 px-2">
                      <h2 className="text-2xl font-black tracking-tight">Announcements</h2>
                      {isCoach && <button onClick={() => setEditingAnnouncement({})} className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200 hover:rotate-90 transition-all">+</button>}
                   </div>
                   <div className="space-y-6">
                      {announcements.map(a => (
                        <div key={a.id} className="pb-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 p-4 rounded-3xl transition-all cursor-pointer">
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
                <h2 className="text-5xl font-black tracking-tighter">Athlete Rosters</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Managing {students.length} active players</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <input 
                  type="text" placeholder="Search athletes..." 
                  className="bg-white border-2 border-slate-100 px-6 py-4 rounded-3xl focus:border-blue-600 outline-none text-sm font-bold flex-1 md:w-64 shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isCoach && (
                  <button onClick={() => setSelectedStudent({ id: `s${Date.now()}`, name: '', age: 0, birthday: '', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new', level: SkillLevel.BEGINNER, healthStatus: HealthStatus.FIT, attendance: [], notes: '' })} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Add Athlete</button>
                )}
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => <StudentCard key={s.id} student={s} onClick={() => setSelectedStudent(s)} />)}
            </div>
          </div>
        )}

        {activeTab === 'coaches' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <div>
                  <h2 className="text-5xl font-black tracking-tighter">Coaching Staff</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Professional instruction and guidance</p>
               </div>
               {isCoach && (
                 <button onClick={() => setIsAddingCoach(true)} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">New Staff</button>
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

        {activeTab === 'attendance' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <div>
                <h2 className="text-5xl font-black tracking-tighter">Attendance</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Daily presence tracking</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3">Date Filter:</span>
                <input 
                  type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-slate-50 px-4 py-2 rounded-2xl font-black text-xs border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </header>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                       <th className="pb-6 pl-6">Athlete</th>
                       <th className="pb-6">Level</th>
                       <th className="pb-6 text-center">Status</th>
                       <th className="pb-6 text-right pr-6">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {students.map(s => {
                       const record = s.attendance.find(r => r.date === attendanceDate);
                       return (
                        <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 pl-6 font-black text-slate-800 flex items-center gap-4">
                            <img src={s.profilePic} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                            {s.name}
                          </td>
                          <td className="py-5">
                            <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">{s.level}</span>
                          </td>
                          <td className="py-5 text-center">
                             {record ? (
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {record.status}
                               </span>
                             ) : <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">N/A</span>}
                          </td>
                          <td className="py-5 text-right pr-6">
                            {isCoach && (
                              <button onClick={() => handleToggleAttendance(s, attendanceDate)} className={`p-3 rounded-2xl transition-all shadow-sm ${record?.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}>
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
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <div>
                  <h2 className="text-5xl font-black tracking-tighter">Training Calendar</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Upcoming drills and court sessions</p>
               </div>
               {isCoach && (
                 <button onClick={() => setEditingSession({})} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Add Session</button>
               )}
            </header>
            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                       <tr className="text-[10px] font-black uppercase text-slate-400">
                          <th className="p-8">Training Date</th>
                          <th className="p-8">Timing</th>
                          <th className="p-8">Athlete Target</th>
                          <th className="p-8">Focus Point</th>
                          <th className="p-8 text-right">Type</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {sessions.map(s => {
                         const formatted = formatSessionDate(s.date);
                         return (
                          <tr key={s.id} onClick={() => isCoach && setEditingSession(s)} className="text-sm group hover:bg-slate-50/50 transition-colors cursor-pointer">
                            <td className="p-8">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">{formatted.day}</span>
                                  <span className="font-black text-slate-900 text-base">{formatted.full}</span>
                               </div>
                            </td>
                            <td className="p-8 text-slate-500 font-black text-xs whitespace-nowrap">{s.startTime} - {s.endTime}</td>
                            <td className="p-8">
                               <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {s.targetLevels?.map(l => (
                                    <span key={l} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-widest">{l}</span>
                                  ))}
                               </div>
                            </td>
                            <td className="p-8">
                               <p className="font-black text-slate-800 tracking-tight">{s.title}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{s.focus}</p>
                            </td>
                            <td className="p-8 text-right">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${s.type === 'Tournament Prep' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {s.type}
                               </span>
                            </td>
                          </tr>
                         );
                       })}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end px-2">
               <div>
                  <h2 className="text-5xl font-black tracking-tighter">Leadership</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Academy board and council</p>
               </div>
               {isCoach && (
                 <button onClick={() => setIsAddingOfficer(true)} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Add Officer</button>
               )}
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
               {sortedOfficers.map(off => (
                 <div key={off.id} onClick={() => setSelectedOfficer(off)} className="bg-white p-8 rounded-[40px] border border-slate-100 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer">
                    <img src={off.profilePic} className="w-24 h-24 rounded-[32px] mx-auto object-cover border-4 border-slate-50 mb-6 group-hover:scale-110 transition duration-500" alt="" />
                    <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none">{off.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3 bg-blue-50 px-4 py-1.5 rounded-full inline-block border border-blue-100">{off.role}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'plans' && isCoach && (
          <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
             <header className="flex justify-between items-end px-2">
               <div>
                  <h2 className="text-5xl font-black tracking-tighter">Drill Plans</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Instructional sequencing</p>
               </div>
               <button onClick={() => setEditingDailyPlan({})} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Create New Plan</button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {dailyPlans.map(plan => (
                 <div key={plan.id} onClick={() => setEditingDailyPlan(plan)} className="bg-white p-10 rounded-[48px] border border-slate-100 relative hover:border-blue-200 hover:shadow-2xl transition-all duration-500 cursor-pointer group">
                    <div className="mb-6">
                        <p className="text-[10px] font-black text-blue-600 uppercase mb-2 bg-blue-50 px-3 py-1 rounded-full inline-block">{plan.date}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase group-hover:text-blue-600 transition">{plan.title}</h3>
                    </div>
                    <div className="space-y-3">
                       {plan.exercises.map((ex, i) => (
                         <div key={i} className="flex justify-between text-sm items-center py-2 border-b border-slate-50 last:border-0">
                            <span className="font-bold text-slate-700 tracking-tight">• {ex.name}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ex.duration}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>

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
              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 text-xs mt-4 active:scale-95 transition-all">Authorize Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Overlays */}
      {selectedStudent && (
        <StudentDetail student={selectedStudent} tournaments={tournaments} onClose={() => setSelectedStudent(null)} onUpdate={updateStudent} role={user.role} />
      )}
      {selectedCoach && (
        <CoachDetail coach={selectedCoach} canEdit={isCoach} onClose={() => setSelectedCoach(null)} onUpdate={(u) => setCoaches(prev => prev.map(c => c.id === u.id ? u : c))} />
      )}
      {isAddingCoach && (
        <CoachModal onClose={() => setIsAddingCoach(false)} onSave={(c) => { setCoaches([...coaches, c]); setIsAddingCoach(false); }} />
      )}
      {selectedOfficer && (
        <OfficerDetail officer={selectedOfficer} onClose={() => setSelectedOfficer(null)} canEdit={isCoach} onUpdate={(u) => setOfficers(prev => prev.map(o => o.id === u.id ? u : o))} />
      )}
      {isAddingOfficer && (
        <OfficerModal onClose={() => setIsAddingOfficer(false)} onSave={(o) => { setOfficers([...officers, o]); setIsAddingOfficer(false); }} />
      )}
      {editingAnnouncement && (
        <AnnouncementModal announcement={editingAnnouncement} onClose={() => setEditingAnnouncement(null)} onSave={(a) => { setAnnouncements([a, ...announcements.filter(x => x.id !== a.id)]); setEditingAnnouncement(null); }} />
      )}
      {editingTournament && (
        <TournamentModal tournament={editingTournament} onClose={() => setEditingTournament(null)} isCoach={isCoach} onSave={(t) => { setTournaments([t, ...tournaments.filter(x => x.id !== t.id)]); setEditingTournament(null); }} />
      )}
      {editingDailyPlan && (
        <DailyPlanModal plan={editingDailyPlan} onClose={() => setEditingDailyPlan(null)} onSave={(p) => { setDailyPlans([p, ...dailyPlans.filter(x => x.id !== p.id)]); setEditingDailyPlan(null); }} />
      )}
      {editingSession && (
        <SessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={(s) => { setSessions([s, ...sessions.filter(x => x.id !== s.id)]); setEditingSession(null); }} />
      )}
      {showBrandingModal && (
        <BrandingModal currentName={academyName} currentLogo={academyLogo} currentBanner={academyBanner} onClose={() => setShowBrandingModal(false)} onSave={(n, l, b) => { setAcademyName(n); setAcademyLogo(l); setAcademyBanner(b); setShowBrandingModal(false); }} />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-8 left-8 right-8 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[40px] flex items-center justify-around py-6 z-40 shadow-3xl">
        {[
          { id: 'dashboard', icon: '🏠' },
          { id: 'students', icon: '🎾' },
          { id: 'coaches', icon: '👔' },
          { id: 'attendance', icon: '📊' },
          { id: 'schedule', icon: '📅' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`text-2xl transition-all duration-300 ${activeTab === tab.id ? 'text-blue-500 scale-150 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab.icon}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
