
import { Student, SkillLevel, HealthStatus, Tournament, Coach, Announcement, TrainingSession, Officer, MonthlyProgram, DailyPlan } from './types';

export const INITIAL_COACHES: Coach[] = [
  {
    id: 'c1',
    name: 'Coach Ricardo Santos',
    email: 'coach.rick@talons.com',
    password: 'password',
    specialization: 'Advanced Footwork & Strategy',
    profilePic: 'https://picsum.photos/seed/coach1/400/400',
    age: 38,
    phone: '0917-123-4567'
  },
  {
    id: 'c2',
    name: 'Coach Elena Cruz',
    email: 'coach.elena@talons.com',
    password: 'password',
    specialization: 'Junior Development & Agility',
    profilePic: 'https://picsum.photos/seed/coach2/400/400',
    age: 29,
    phone: '0918-987-6543'
  }
];

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'o1',
    name: 'Marcus Aurelius',
    role: 'President',
    profilePic: 'https://picsum.photos/seed/off1/400/400',
    contact: '09123456789'
  },
  {
    id: 'o2',
    name: 'Sophia Loren',
    role: 'Vice President',
    profilePic: 'https://picsum.photos/seed/off2/400/400',
    contact: '09123456788'
  },
  {
    id: 'o3',
    name: 'Lester Bangs',
    role: 'Secretary',
    profilePic: 'https://picsum.photos/seed/off3/400/400',
    contact: '09123456787'
  },
  {
    id: 'o4',
    name: 'Clara Oswald',
    role: 'Treasurer',
    profilePic: 'https://picsum.photos/seed/off4/400/400',
    contact: '09123456786'
  },
  {
    id: 'o5',
    name: 'Danny Pink',
    role: 'Auditor',
    profilePic: 'https://picsum.photos/seed/off5/400/400',
    contact: '09123456785'
  },
  {
    id: 'o6',
    name: 'Amy Pond',
    role: 'P.I.O.',
    profilePic: 'https://picsum.photos/seed/off6/400/400',
    contact: '09123456784'
  },
  {
    id: 'o7',
    name: 'Rory Williams',
    role: 'Sgt. at Arms',
    profilePic: 'https://picsum.photos/seed/off7/400/400',
    contact: '09123456783'
  }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 't1',
    name: 'Dumaguete City Open 2024',
    date: '2024-06-12',
    location: 'Lamberto Macias Sports Complex',
    categories: ['Mens Singles Open', 'Mixed Doubles U-17', 'Boys Singles U-15'],
    description: 'The premier city-wide open tournament for all Dumaguete badminton enthusiasts. Multiple categories ranging from youth to senior levels.'
  },
  {
    id: 't2',
    name: 'Negros Oriental Regional Meet',
    date: '2024-07-05',
    location: 'Silliman Gym',
    categories: ['Boys Singles U-15', 'Girls Singles U-15', 'Mens Doubles Open'],
    description: 'Regional level competition bringing together top talents from all over Negros Oriental. Qualification for state finals at stake.'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Juan Dela Cruz',
    age: 14,
    birthday: '2010-05-15',
    profilePic: 'https://picsum.photos/seed/s1/400/400',
    level: SkillLevel.INTERMEDIATE,
    healthStatus: HealthStatus.FIT,
    attendance: [
      { date: '2024-05-25', status: 'present' }
    ],
    tournamentIds: ['t1'],
    notes: 'Strong smash, needs improvement on backhand clears.'
  },
  {
    id: 's2',
    name: 'Maria Clara',
    age: 12,
    birthday: '2012-11-20',
    profilePic: 'https://picsum.photos/seed/s2/400/400',
    level: SkillLevel.BEGINNER,
    healthStatus: HealthStatus.INJURY,
    attendance: [],
    tournamentIds: [],
    notes: 'Very fast on court, focusing on basic net play.'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'New Training Schedule for June',
    content: 'Starting next Monday, all intermediate classes will be moved to 4 PM. Please check your assigned courts.',
    date: '2024-05-20',
    author: 'Coach Rick'
  }
];

export const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: 'sess1',
    title: 'Morning Elite Drills',
    date: '2024-05-25',
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    focus: 'Multi-shuttle smash accuracy',
    type: 'Regular',
    targetLevels: [SkillLevel.ELITE, SkillLevel.ADVANCED]
  }
];

export const INITIAL_MONTHLY_PROGRAMS: MonthlyProgram[] = [
  {
    id: 'mp1',
    month: '2024-05',
    title: 'Agility & Footwork Focus',
    description: 'This month focuses on building a solid base through explosive movements and shadow training.',
    goals: ['Master 6-point shadow', 'Increase court speed by 10%', 'Consistency in defensive recovery']
  }
];

export const INITIAL_DAILY_PLANS: DailyPlan[] = [
  {
    id: 'dp1',
    date: '2024-05-25',
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    totalDuration: '120 mins',
    title: 'High-Intensity Smash Block',
    exercises: [
      { name: 'Warm-up: Dynamic Stretching', duration: '15 mins' },
      { name: 'Footwork: 6-Point Shadow', duration: '20 mins' },
      { name: 'Drill: Multi-shuttle Attacking', duration: '45 mins' },
      { name: 'Match: Tactical Half-Court', duration: '30 mins' },
      { name: 'Cool down: Static Stretching', duration: '10 mins' }
    ],
    notes: 'Today\'s focus is exclusively on steepness of the smash. Ensure students keep their elbow high.'
  }
];
