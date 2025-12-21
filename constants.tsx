import { Student, SkillLevel, HealthStatus, Tournament, Coach, Announcement, TrainingSession, Officer, DailyPlan } from './types';

export const INITIAL_COACHES: Coach[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    name: 'Coach Ricardo Santos',
    email: 'coach.rick@talons.com',
    password: 'password',
    specialization: 'Advanced Footwork & Strategy',
    profile_pic: 'https://picsum.photos/seed/coach1/400/400',
    age: 38,
    phone: '0917-123-4567'
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
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
    id: '33333333-3333-4333-a333-333333333333',
    name: 'Marcus Aurelius',
    role: 'President',
    profile_pic: 'https://picsum.photos/seed/off1/400/400',
    contact: '09123456789'
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    name: 'Sophia Loren',
    role: 'Vice President',
    profile_pic: 'https://picsum.photos/seed/off2/400/400',
    contact: '09123456788'
  },
  {
    id: '55555555-5555-4555-a555-555555555555',
    name: 'Lester Bangs',
    role: 'Secretary',
    profile_pic: 'https://picsum.photos/seed/off3/400/400',
    contact: '09123456787'
  }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '66666666-6666-4666-a666-666666666666',
    name: 'Dumaguete City Open 2024',
    date: '2024-06-12',
    location: 'Lamberto Macias Sports Complex',
    categories: ['Mens Singles Open', 'Mixed Doubles U-17'],
    description: 'Premier city-wide open tournament.'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: '77777777-7777-4777-a777-777777777777',
    name: 'Juan Dela Cruz',
    age: 14,
    birthday: '2010-05-15',
    profile_pic: 'https://picsum.photos/seed/s1/400/400',
    level: SkillLevel.INTERMEDIATE,
    health_status: HealthStatus.FIT,
    attendance: [{ date: '2024-05-25', status: 'present' }],
    tournament_ids: ['66666666-6666-4666-a666-666666666666'],
    notes: 'Strong smash, needs improvement on backhand clears.'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '88888888-8888-4888-a888-888888888888',
    title: 'New Training Schedule for June',
    content: 'All classes will be moved to 4 PM.',
    date: '2024-05-20',
    author: 'Coach Rick'
  }
];

export const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: '99999999-9999-4999-a999-999999999999',
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
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
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