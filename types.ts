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
  start_time: string;
  end_time: string;
  focus: string;
  type: 'Regular' | 'Special' | 'Tournament Prep';
  target_levels: SkillLevel[];
}

export interface Exercise {
  name: string;
  duration: string;
  description?: string;
}

export interface DailyPlan {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_duration: string;
  title: string;
  exercises: Exercise[];
  notes?: string;
}

export interface MonthlyProgram {
  id: string;
  month: string;
  title: string;
  description: string;
  goals: string[];
}

export interface TournamentDay {
  date: string;
  categories: string[];
}

export interface Tournament {
  id: string;
  name: string;
  date: string; // Primary start date
  location: string;
  categories: string[]; // Flat list (combined categories for summary)
  description?: string;
  schedule?: TournamentDay[]; // New multi-day schedule
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  birthday: string;
  profile_pic: string;
  level: SkillLevel;
  health_status: HealthStatus;
  attendance: AttendanceRecord[];
  tournament_ids?: string[];
  notes: string;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  password?: string;
  specialization: string;
  profile_pic: string;
  age: number;
  phone: string;
}

export interface Officer {
  id: string;
  name: string;
  role: string;
  profile_pic: string;
  contact?: string;
}

export type UserRole = 'coach' | 'student';

export interface UserState {
  isLoggedIn: boolean;
  role: UserRole;
  profile: Coach | null;
}