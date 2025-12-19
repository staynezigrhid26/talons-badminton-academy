import { Student, SkillLevel, HealthStatus, Tournament, Coach, Announcement, TrainingSession, Officer, DailyPlan } from './types';

export const INITIAL_COACHES: Coach[] = [
  {
    id: 'c1',
    name: 'Coach Ricardo Santos',
    email: 'coach.rick@talons.com',
    password: 'password',
    specialization: 'Advanced Footwork & Strategy',
    profile_pic: 'https://picsum.photos/seed/coach1/400/400',
    age: 38,
    phone: '0917-123-4567'
  },
  {
    id: 'c2',
    name: 'Coach Elena Cruz',
    email: 'coach.elena@talons.com',
    password: 'password',
    specialization: 'Junior Development & Agility',
    profile_pic: 'https://picsum.photos/seed/coach2/400/400',
    age: 29,
    phone: '0918-987-6543'
  }
];

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'o1',
    name: 'Marcus Aurelius',
    role: 'President',
    profile_pic: 'https://picsum.photos/seed/off1/400/400',
    contact: '09123456789'
  },
  {
    id: 'o2',
    name: 'Sophia Loren',
    role: 'Vice President',
    profile_pic: 'https://picsum.photos/seed/off2/400/400',
    contact: '09123456788'
  },
  {
    id: 'o3',
    name: 'Lester Bangs',
    role: 'Secretary',
    profile_pic: 'https://picsum.photos/seed/off3/400/400',
    contact: '09123456787'
  }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 't1',
    name: 'Dumaguete City Open 2024',
    date: '2024-06-12',
    location: 'Lamberto Macias Sports Complex',
    categories: ['Mens Singles Open', 'Mixed Doubles U-17'],
    description: 'Premier city-wide open tournament.'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Juan Dela Cruz',
    age: 14,
    birthday: '2010-05-15',
    profile_pic: 'https://picsum.photos/seed/s1/400/400',
    level: SkillLevel.INTERMEDIATE,
    health_status: HealthStatus.FIT,
    attendance: [{ date: '2024-05-25', status: 'present' }],
    tournament_ids: ['t1'],
    notes: 'Strong smash, needs improvement on backhand clears.'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'New Training Schedule for June',
    content: 'All classes will be moved to 4 PM.',
    date: '2024-05-20',
    author: 'Coach Rick'
  }
];

export const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: 'sess1',
    title: 'Morning Elite Drills',
    date: '2024-05-25',
    start_time: '08:00 AM',
    end_time: '10:00 AM',
    focus: 'Multi-shuttle smash accuracy',
    type: 'Regular',
    target_levels: [SkillLevel.ELITE, SkillLevel.ADVANCED]
  }
];

export const INITIAL_DAILY_PLANS: DailyPlan[] = [
  {
    id: 'dp1',
    date: '2024-05-25',
    start_time: '08:00 AM',
    end_time: '10:00 AM',
    total_duration: '120 mins',
    title: 'High-Intensity Smash Block',
    exercises: [
      { name: 'Warm-up: Dynamic Stretching', duration: '15 mins' },
      { name: 'Drill: Multi-shuttle Attacking', duration: '45 mins' }
    ],
    notes: 'Focus on smash steepness.'
  }
];