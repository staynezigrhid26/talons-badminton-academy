import React from 'react';
import { Student, SkillLevel, HealthStatus } from '../types';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
  const getLevelColor = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER: return 'bg-green-100 text-green-700';
      case SkillLevel.INTERMEDIATE: return 'bg-blue-100 text-blue-700';
      case SkillLevel.ADVANCED: return 'bg-orange-100 text-orange-700';
      case SkillLevel.ELITE: return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getHealthStatusColor = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.FIT: return 'text-emerald-500 bg-emerald-50';
      case HealthStatus.INJURY: return 'text-rose-500 bg-rose-50';
      case HealthStatus.RESTING: return 'text-amber-500 bg-amber-50';
      case HealthStatus.MEDICAL: return 'text-indigo-500 bg-indigo-50';
      case HealthStatus.DISMISSED: return 'text-slate-400 bg-slate-100 opacity-60';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] ${student.health_status === HealthStatus.DISMISSED ? 'grayscale-[0.5] opacity-80' : ''}`}
    >
      <img 
        src={student.profile_pic} 
        alt={student.name} 
        className={`w-16 h-16 rounded-full object-cover border-2 border-slate-100 ${student.health_status === HealthStatus.DISMISSED ? 'opacity-50' : ''}`}
      />
      <div className="flex-1">
        <h3 className={`font-bold text-slate-800 text-lg leading-tight ${student.health_status === HealthStatus.DISMISSED ? 'text-slate-400 line-through' : ''}`}>{student.name}</h3>
        <p className="text-sm text-slate-500">{student.age} years old</p>
        <div className="flex gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getLevelColor(student.level)}`}>
            {student.level}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getHealthStatusColor(student.health_status)}`}>
            {student.health_status}
          </span>
        </div>
      </div>
      <div className="text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default StudentCard;