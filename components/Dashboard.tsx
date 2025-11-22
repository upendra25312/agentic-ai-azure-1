import React from 'react';
import { 
  Map, 
  Calendar, 
  Award, 
  MessageCircle, 
  Cloud, 
  BookOpen, 
  Terminal, 
  FileText, 
  ExternalLink,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  LogIn,
  HardDrive
} from 'lucide-react';
import { Phase, Status, GoogleUser } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GOOGLE_CLIENT_ID } from '../constants';

// Learning Resources Data
const LEARNING_RESOURCES = [
  {
    title: "Official Microsoft Paths",
    icon: BookOpen,
    color: "text-blue-400",
    items: [
      { name: "Develop Generative AI Solutions with Azure OpenAI", link: "https://learn.microsoft.com/en-us/training/paths/develop-ai-solutions-azure-openai/" },
      { name: "Create custom copilots with Copilot Studio", link: "https://learn.microsoft.com/en-us/training/paths/create-copilots-copilot-studio/" },
      { name: "Azure AI Engineer Associate (AI-102)", link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/" },
      { name: "Fundamentals of Generative AI", link: "https://learn.microsoft.com/en-us/training/paths/introduction-generative-ai/" }
    ]
  },
  {
    title: "Labs & GitHub Repos",
    icon: Terminal,
    color: "text-emerald-400",
    items: [
      { name: "Semantic Kernel (Orchestration SDK)", link: "https://github.com/microsoft/semantic-kernel" },
      { name: "AutoGen (Multi-Agent Framework)", link: "https://github.com/microsoft/autogen" },
      { name: "Azure AI Agent Service Samples", link: "https://github.com/Azure-Samples/azure-ai-agents-samples" },
      { name: "Azure Search Vector Embedding Labs", link: "https://github.com/Azure-Samples/azure-search-vector-samples" }
    ]
  },
  {
    title: "Study Guides & Specialized Courses",
    icon: FileText,
    color: "text-red-400",
    items: [
      { name: "Study Guide: AB-900 (Copilot Admin)", link: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-900" },
      { name: "Study Guide: AB-730 (AI Business)", link: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-730" },
      { name: "Study Guide: AB-731 (Transformation Lead)", link: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-731" },
      { name: "Building Agents with Semantic Kernel (YouTube)", link: "https://www.youtube.com/watch?v=1y_q4rK_qwE" },
      { name: "Microsoft Mechanics: AI Playlist", link: "https://www.youtube.com/playlist?list=PLlVtbbG169nHz2qfCj4KbhX3smlfSQT7f" }
    ]
  }
];

interface DashboardProps {
  onOpenChat: () => void;
  data: Phase[];
  googleUser: GoogleUser | null;
  onConnect: () => void;
  onExport: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenChat, data, googleUser, onConnect, onExport }) => {
  // --- Statistics Calculation ---
  const allCerts = data.flatMap(p => p.certs);
  const totalCerts = allCerts.length;
  const completedCerts = allCerts.filter(c => c.status === Status.COMPLETED).length;
  const inProgressCerts = allCerts.filter(c => c.status === Status.IN_PROGRESS).length;
  
  // Percentages for Progress Bar
  const completedPct = Math.round((completedCerts / totalCerts) * 100) || 0;
  const inProgressPct = Math.round((inProgressCerts / totalCerts) * 100) || 0;

  const currentPhase = data.find(p => p.certs.some(c => c.status === Status.IN_PROGRESS)) || 
                       data.find(p => p.certs.some(c => c.status !== Status.COMPLETED)) || 
                       data[data.length - 1];

  const nextMilestone = currentPhase.certs.find(c => c.status !== Status.COMPLETED);

  // --- Chart Data Preparation ---
  const chartData = data.map(phase => ({
    name: `Phase ${phase.id}`,
    completed: phase.certs.filter(c => c.status === Status.COMPLETED).length,
    inProgress: phase.certs.filter(c => c.status === Status.IN_PROGRESS).length,
    skills: phase.skills.filter(s => s.mastered).length,
    totalSkills: phase.skills.length
  }));

  const isClientConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-white/10 p-8 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome, Architect.</h1>
          <p className="text-blue-200 mt-2 text-lg max-w-2xl">
            Your journey to becoming a Microsoft Agentic AI Architect is tracked here. 
            Build agents, master governance, and lead the transformation.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              onClick={onOpenChat}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Consult AI Mentor
            </button>
            {!googleUser && isClientConfigured && (
              <button 
                onClick={onConnect}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-semibold flex items-center gap-2 transition-all backdrop-blur-sm"
              >
                <LogIn className="w-5 h-5" />
                Sign In with Google
              </button>
            )}
            {!isClientConfigured && (
               <button 
                  onClick={onExport}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg font-medium flex items-center gap-2 backdrop-blur-sm transition-all group"
                  title="Download a backup of your progress"
               >
                  <HardDrive className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
                  Backup Local Save
               </button>
            )}
          </div>
        </div>
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Enhanced Progress Card */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-xl group hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Certification Path</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-white">{completedCerts + inProgressCerts}</h3>
                <span className="text-sm text-slate-500">/ {totalCerts}</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
               <Award className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          
          {/* Segmented Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden flex">
            {/* Completed Segment */}
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000 ease-out relative group/seg" 
              style={{ width: `${completedPct}%` }}
            >
               {completedPct > 0 && <div className="opacity-0 group-hover/seg:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-emerald-900 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded border border-emerald-700 whitespace-nowrap transition-opacity">Done</div>}
            </div>
            {/* In Progress Segment */}
            <div 
              className="bg-blue-500 h-full transition-all duration-1000 ease-out relative group/seg" 
              style={{ width: `${inProgressPct}%` }}
            >
               {inProgressPct > 0 && <div className="opacity-0 group-hover/seg:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-blue-900 text-blue-200 text-[10px] px-1.5 py-0.5 rounded border border-blue-700 whitespace-nowrap transition-opacity">Active</div>}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex gap-4 mt-2">
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-slate-400">Completed ({completedPct}%)</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-slate-400">In Progress ({inProgressPct}%)</span>
             </div>
          </div>
        </div>

        {/* Current Focus Card */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-xl group hover:border-indigo-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Phase</p>
              <h3 className="text-2xl font-bold text-indigo-100 mt-2">{currentPhase.title.split(':')[0]}</h3>
              <p className="text-xs text-indigo-300 mt-1">{currentPhase.focus}</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Map className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Next Milestone Card */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-xl group hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {nextMilestone?.status === Status.IN_PROGRESS ? 'Currently Studying' : 'Next Up'}
              </p>
              <h3 className="text-2xl font-bold text-emerald-100 mt-2">{nextMilestone ? nextMilestone.code : 'All Done!'}</h3>
              <p className="text-xs text-emerald-300 mt-1">{nextMilestone ? nextMilestone.name : 'Congratulations'}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              {nextMilestone?.status === Status.IN_PROGRESS ? (
                <PlayCircle className="w-6 h-6 text-blue-400" />
              ) : (
                <Calendar className="w-6 h-6 text-emerald-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
            Velocity & Workload
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                {/* Stacked Bars for Certs */}
                <Bar dataKey="completed" name="Completed Certs" stackId="certs" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="inProgress" name="In Progress" stackId="certs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                
                {/* Separate Bar for Skills */}
                <Bar dataKey="skills" name="Mastered Skills" stackId="skills" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Learning Links */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-yellow-400" />
              Top Resources
            </h3>
            <div className="space-y-3">
              {LEARNING_RESOURCES.flatMap(c => c.items).slice(0, 5).map((item, i) => (
                 <a 
                    key={i}
                    href={item.link}
                    target="_blank" 
                    rel="noreferrer"
                    className="block p-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors group"
                 >
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-slate-300 group-hover:text-white transition-colors line-clamp-1">{item.name}</span>
                       <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                 </a>
              ))}
              <div className="text-center pt-2">
                 <p className="text-xs text-slate-500">Check the Learning tab for full list</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;