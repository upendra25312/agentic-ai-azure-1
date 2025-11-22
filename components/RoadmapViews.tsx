import React, { useState } from 'react';
import { 
  Phase, 
  Status, 
  WeeklyTask 
} from '../types';
import { 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  Lock, 
  CheckCircle2, 
  PlayCircle,
  Map,
  BookOpen,
  Briefcase,
  CheckSquare,
  Award,
  Terminal,
  Cloud, 
  Bot,
  Layers,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Settings 
} from 'lucide-react';
import { WEEKLY_SCHEDULE } from '../constants';

// --- Helper: Get Icon by Cert Code ---
const getCertIcon = (code: string) => {
  const c = code.toLowerCase();
  // Azure / Infrastructure
  if (c.includes('ai-900')) return Cloud; 
  // Agents / Copilot
  if (c.includes('copilot')) return Bot; 
  // Platform Foundations
  if (c.includes('pl-900')) return Layers; 
  // Consultant / Configuration (Gears)
  if (c.includes('pl-200')) return Settings; 
  // Admin / Security / Governance
  if (c.includes('ab-900')) return ShieldCheck; 
  // Business / Professional
  if (c.includes('ab-730')) return Briefcase; 
  // Engineer / Compute / Hard Skills
  if (c.includes('ai-102')) return Cpu; 
  // Leader / Strategy / Growth
  if (c.includes('ab-731')) return TrendingUp; 
  // Architect / Master
  if (c.includes('ab-100')) return Award; 
  
  return FileText;
};

// --- Roadmap Component ---
export const Roadmap: React.FC<{ 
  data: Phase[], 
  onToggleCertStatus: (phaseId: number, certCode: string) => void 
}> = ({ data, onToggleCertStatus }) => {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  const getStatusColor = (status: Status) => {
    switch(status) {
      case Status.COMPLETED: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case Status.IN_PROGRESS: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-slate-100">Certification Path</h2>
         <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Click a card to update status</span>
      </div>

      <div className="space-y-4">
        {data.map((phase) => {
          const isPhaseComplete = phase.certs.every(c => c.status === Status.COMPLETED);
          const isPhaseActive = phase.certs.some(c => c.status === Status.IN_PROGRESS);

          return (
            <div key={phase.id} className={`
              rounded-xl overflow-hidden transition-all duration-300 border
              ${isPhaseActive ? 'border-blue-500/50 shadow-lg shadow-blue-900/20' : 'border-slate-700 shadow-md'}
              ${isPhaseComplete ? 'bg-slate-900/80 border-emerald-900/50' : 'bg-slate-800'}
            `}>
              <button 
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner
                    ${isPhaseComplete ? 'bg-emerald-600 text-white' : (phase.id === 1 || isPhaseActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400')}
                  `}>
                    {isPhaseComplete ? <CheckCircle2 className="w-6 h-6" /> : phase.id}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">{phase.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-900/50 border border-slate-700">{phase.duration}</span>
                       <span className="text-xs text-slate-500 hidden sm:inline">• {phase.focus}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${expandedPhase === phase.id ? 'rotate-90' : ''}`} />
              </button>

              {expandedPhase === phase.id && (
                <div className="p-6 pt-0 border-t border-white/5 bg-black/20">
                  <p className="text-slate-300 mt-4 mb-6 leading-relaxed max-w-3xl">{phase.description}</p>
                  
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Certifications & Exams
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phase.certs.map((cert) => {
                      const CertIcon = getCertIcon(cert.code);
                      return (
                        <div 
                          key={cert.code} 
                          className={`
                            group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer
                            ${getStatusColor(cert.status)}
                            hover:shadow-lg hover:-translate-y-0.5
                          `}
                          onClick={() => onToggleCertStatus(phase.id, cert.code)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                cert.status === Status.COMPLETED ? 'bg-emerald-500/20 text-emerald-300' : 
                                cert.status === Status.IN_PROGRESS ? 'bg-blue-500/20 text-blue-300' : 
                                'bg-slate-700/50 text-slate-400'
                              }`}>
                                <CertIcon className="w-5 h-5" />
                              </div>
                              <span className="font-mono text-sm font-bold">{cert.code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                {cert.status.replace('_', ' ')}
                              </span>
                              {cert.status === Status.COMPLETED ? <CheckCircle2 className="w-4 h-4" /> : 
                               cert.status === Status.IN_PROGRESS ? <PlayCircle className="w-4 h-4" /> : 
                               <Lock className="w-4 h-4 opacity-50" />}
                            </div>
                          </div>
                          
                          <h5 className="font-bold text-base mb-2 text-slate-200 pl-1">{cert.name}</h5>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-4 min-h-[2.5em] pl-1">{cert.description}</p>
                          
                          <div className="flex gap-3 mt-auto pt-3 border-t border-white/10 pl-1" onClick={(e) => e.stopPropagation()}>
                            <a 
                              href={cert.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors font-medium"
                            >
                              Exam Details <ExternalLink className="w-3 h-3" />
                            </a>
                            {cert.studyGuide && (
                              <a 
                                href={cert.studyGuide} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors font-medium"
                              >
                                 Study Guide <FileText className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Projects Component ---
export const Projects: React.FC<{ 
  data: Phase[],
  onToggleProjectStatus: (phaseId: number, projectTitle: string) => void 
}> = ({ data, onToggleProjectStatus }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
         <h2 className="text-2xl font-bold text-slate-100">Applied Labs</h2>
         <p className="text-slate-400 text-sm">Theory is nothing without practice. Complete these labs to build your portfolio.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.flatMap(p => p.projects.map(proj => ({ ...proj, phaseId: p.id }))).map((project, idx) => (
          <div key={idx} className={`
            rounded-xl border overflow-hidden flex flex-col transition-all
            ${project.status === Status.COMPLETED ? 'bg-slate-900 border-emerald-900/50' : 
              project.status === Status.IN_PROGRESS ? 'bg-slate-800 border-blue-500/30' : 
              'bg-slate-800 border-slate-700 opacity-70 hover:opacity-100'}
          `}>
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${project.status === Status.COMPLETED ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      <Terminal className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-100">{project.title}</h3>
                </div>
                <div onClick={() => onToggleProjectStatus(project.phaseId, project.title)} className="cursor-pointer hover:scale-110 transition-transform">
                   {project.status === Status.COMPLETED ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                    project.status === Status.IN_PROGRESS ? <PlayCircle className="w-6 h-6 text-blue-500" /> :
                    <Lock className="w-5 h-5 text-slate-600" />}
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed border-l-2 border-slate-700 pl-3">{project.description}</p>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tech Stack</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.techStack.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-slate-950 text-slate-300 text-xs font-medium rounded-md border border-slate-800">{t}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deliverables</span>
                  <ul className="mt-2 space-y-1.5">
                    {project.deliverables.map((d, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-black/20 p-4 border-t border-white/5">
               <button 
                 onClick={() => onToggleProjectStatus(project.phaseId, project.title)}
                 className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                    project.status === Status.COMPLETED ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30' :
                    project.status === Status.IN_PROGRESS ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20' :
                    'bg-slate-700 text-slate-300 hover:bg-slate-600'
                 }`}
               >
                 {project.status === Status.COMPLETED ? "Completed" : 
                  project.status === Status.IN_PROGRESS ? "Mark as Complete" : 
                  "Start Lab"}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Schedule Component ---
export const Schedule: React.FC = () => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-slate-100">Weekly Routine</h2>
           <p className="text-slate-400 mt-1">Consistency > Intensity. The 7-hour weekly blueprint.</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-5 border-b border-slate-700">Day</th>
                <th className="p-5 border-b border-slate-700">Activity Focus</th>
                <th className="p-5 border-b border-slate-700">Type</th>
                <th className="p-5 border-b border-slate-700 text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {WEEKLY_SCHEDULE.map((task, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="p-5 font-semibold text-slate-200 border-r border-slate-700/30 bg-slate-800/50">{task.day}</td>
                  <td className="p-5 text-slate-300 group-hover:text-white transition-colors">{task.activity}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                      task.type === 'Theory' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      task.type === 'Lab' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      task.type === 'Build' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {task.type}
                    </span>
                  </td>
                  <td className="p-5 text-right text-slate-400 font-mono">{task.hours > 0 ? `${task.hours}h` : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900">
                <tr>
                    <td colSpan={3} className="p-5 text-right font-bold text-slate-300 uppercase text-xs tracking-wider">Total Weekly Commitment</td>
                    <td className="p-5 text-right font-bold text-blue-400 text-lg font-mono">7.0h</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Skills Component ---
export const Skills: React.FC<{ 
  data: Phase[], 
  onToggleSkill: (phaseId: number, skillName: string) => void 
}> = ({ data, onToggleSkill }) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
               <h2 className="text-2xl font-bold text-slate-100">Architect Skills Matrix</h2>
               <p className="text-slate-400">Track your proficiency across the four pillars of the role.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Architecture', 'Development', 'Governance', 'Business'].map(category => (
                    <div key={category} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors shadow-lg">
                        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-3 border-b border-slate-700 pb-4">
                             {category === 'Architecture' && <div className="p-2 bg-purple-500/20 rounded"><Map className="w-5 h-5 text-purple-400" /></div>}
                             {category === 'Development' && <div className="p-2 bg-blue-500/20 rounded"><BookOpen className="w-5 h-5 text-blue-400" /></div>}
                             {category === 'Governance' && <div className="p-2 bg-red-500/20 rounded"><Lock className="w-5 h-5 text-red-400" /></div>}
                             {category === 'Business' && <div className="p-2 bg-emerald-500/20 rounded"><Briefcase className="w-5 h-5 text-emerald-400" /></div>}
                            {category}
                        </h3>
                        <div className="space-y-1">
                            {data.flatMap(p => p.skills.map(s => ({...s, phaseId: p.id}))).filter(s => s.category === category).map((skill, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => onToggleSkill(skill.phaseId, skill.name)}
                                  className={`
                                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group
                                    ${skill.mastered ? 'bg-blue-900/20 border border-blue-500/20' : 'hover:bg-slate-700/50 border border-transparent'}
                                  `}
                                >
                                    <div className={`
                                      w-5 h-5 rounded border flex items-center justify-center transition-colors
                                      ${skill.mastered ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-900 group-hover:border-blue-400'}
                                    `}>
                                        {skill.mastered && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className={`text-sm font-medium transition-colors ${skill.mastered ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                      {skill.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- SearchResults Component ---
export const SearchResults: React.FC<{
  data: Phase[];
  query: string;
  onToggleCertStatus: (phaseId: number, certCode: string) => void;
  onToggleProjectStatus: (phaseId: number, projectTitle: string) => void;
  onToggleSkill: (phaseId: number, skillName: string) => void;
}> = ({ data, query, onToggleCertStatus, onToggleProjectStatus, onToggleSkill }) => {
  const lowerQuery = query.toLowerCase();

  // Filtering Logic
  const filteredCerts = data.flatMap(p => p.certs.map(c => ({ ...c, phaseId: p.id })))
    .filter(c => c.name.toLowerCase().includes(lowerQuery) || c.code.toLowerCase().includes(lowerQuery) || c.description.toLowerCase().includes(lowerQuery));
  
  const filteredProjects = data.flatMap(p => p.projects.map(pr => ({ ...pr, phaseId: p.id })))
    .filter(p => p.title.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery) || p.techStack.some(t => t.toLowerCase().includes(lowerQuery)));
  
  const filteredSkills = data.flatMap(p => p.skills.map(s => ({ ...s, phaseId: p.id })))
    .filter(s => s.name.toLowerCase().includes(lowerQuery) || s.category.toLowerCase().includes(lowerQuery));

  // Empty State
  if (!query) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <p className="text-lg">Type to search certifications, projects, and skills...</p>
          </div>
      )
  }

  // No Results
  if (filteredCerts.length === 0 && filteredProjects.length === 0 && filteredSkills.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg">No results found for "{query}"</p>
        </div>
     )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {filteredCerts.length > 0 && (
        <div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Certifications</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCerts.map(cert => (
                    <div 
                        key={cert.code} 
                        onClick={() => onToggleCertStatus(cert.phaseId, cert.code)}
                        className="p-4 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500/50 transition-colors group"
                    >
                       <div className="flex justify-between items-start">
                           <div>
                               <h4 className="font-bold text-slate-200 group-hover:text-white">{cert.code}</h4>
                               <p className="text-sm text-slate-400 mt-1">{cert.name}</p>
                           </div>
                           <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                               cert.status === Status.COMPLETED ? 'bg-emerald-500/20 text-emerald-400' : 
                               cert.status === Status.IN_PROGRESS ? 'bg-blue-500/20 text-blue-400' :
                               'bg-slate-700 text-slate-500'
                            }`}>
                               {cert.status.replace('_', ' ')}
                           </span>
                       </div>
                    </div>
                ))}
             </div>
        </div>
      )}

      {filteredProjects.length > 0 && (
        <div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Projects</h3>
             <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map(proj => (
                    <div 
                        key={proj.title}
                        onClick={() => onToggleProjectStatus(proj.phaseId, proj.title)} 
                        className="p-4 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500/50 transition-colors group"
                    >
                       <div className="flex justify-between items-start">
                           <div>
                               <h4 className="font-bold text-slate-200 group-hover:text-white">{proj.title}</h4>
                               <p className="text-sm text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                           </div>
                           <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md flex-shrink-0 ml-4 ${
                               proj.status === Status.COMPLETED ? 'bg-emerald-500/20 text-emerald-400' : 
                               proj.status === Status.IN_PROGRESS ? 'bg-blue-500/20 text-blue-400' :
                               'bg-slate-700 text-slate-500'
                            }`}>
                               {proj.status.replace('_', ' ')}
                           </span>
                       </div>
                    </div>
                ))}
             </div>
        </div>
      )}

      {filteredSkills.length > 0 && (
        <div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Skills</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredSkills.map(skill => (
                    <div 
                        key={skill.name}
                        onClick={() => onToggleSkill(skill.phaseId, skill.name)} 
                        className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                            skill.mastered ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                    >
                       <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                           skill.mastered ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                       }`}>
                           {skill.mastered && <CheckSquare className="w-3 h-3 text-white" />}
                       </div>
                       <span className={`text-sm font-medium ${skill.mastered ? 'text-white' : 'text-slate-400'}`}>{skill.name}</span>
                    </div>
                ))}
             </div>
        </div>
      )}
    </div>
  );
};