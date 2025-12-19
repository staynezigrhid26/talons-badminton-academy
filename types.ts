
export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  ELITE = 'Elite'
}

export enum HealthStatus {
  FIT = 'Fit to Play',
  INJURY = 'Minor Injury',
  RESTING = 'Resting',
  MEDICAL = 'Under Medical Supervision',
  DISMISSED = 'Dismissed'
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface TrainingSession {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  focus: string;
  type: 'Regular' | 'Special' | 'Tournament Prep';
  targetLevels: SkillLevel[];
}

export interface Exercise {
  name: string;
  duration: string;
  description?: string;
}

export interface TrainingPlan {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalDuration: string;
  title: string;
  exercises: Exercise[];
  notes?: string;
}

export interface DailyPlan {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalDuration: string;
  title: string;
  exercises: Exercise[];
  notes?: string;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  categories: string[];
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface MonthlyProgram {
  id: string;
  month: string; // "YYYY-MM"
  title: string;
  description: string;
  goals: string[];
}

export interface Student {
  id: string;
  name: string;
  age: number;
  birthday: string;
  profilePic: string;
  level: SkillLevel;
  healthStatus: HealthStatus;
  attendance: AttendanceRecord[];
  tournamentIds?: string[]; // IDs of tournaments the student is joining
  trainingPlanId?: string;
  notes: string;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  password?: string;
  specialization: string;
  profilePic: string;
  age: number;
  phone: string;
}

export interface Officer {
  id: string;
  name: string;
  role: string;
  profilePic: string;
  contact?: string;
}

export type UserRole = 'coach' | 'student'; // 'student' here acts as public guest

export interface UserState {
  isLoggedIn: boolean;
  role: UserRole;
  profile: Coach | null;
}
