
import { LearnerProfile } from '../types';

interface ProfileCardProps {
  profile: LearnerProfile;
}

const Tag = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center justify-center bg-slate-900/70 p-3 rounded-lg text-center transition-all duration-300 hover:bg-slate-800/80 hover:scale-105 hover:shadow-lg">
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-cyan-300">{value}</span>
    </div>
);

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        <span>Learner Profile</span>
      </h3>
      <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-cyan-300/10">
        <p className="text-slate-300 mb-4">{profile.summary}</p>
        <div className="grid grid-cols-3 gap-3 stagger-children">
          <div style={{ animationDelay: '0ms' }}>
            <Tag label="Difficulty" value={profile.tags.difficulty} />
          </div>
          <div style={{ animationDelay: '100ms' }}>
            <Tag label="Pace" value={profile.tags.pace} />
          </div>
          <div style={{ animationDelay: '200ms' }}>
            <Tag label="Strategy" value={profile.tags.strategy} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
