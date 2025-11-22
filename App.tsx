import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Cpu,
  Cloud,
  LogOut,
  LogIn,
  RefreshCw,
  Linkedin,
  PlayCircle,
  Search,
  Download,
  HardDrive,
  X,
  ExternalLink
} from 'lucide-react';
import { ROADMAP_DATA, MOCK_USER, MOCK_ROADMAP_DATA, GOOGLE_CLIENT_ID, DRIVE_FOLDER_ID } from './constants';
import { Phase, Status, GoogleUser } from './types';
import MentorChat from './components/MentorChat';
import Dashboard from './components/Dashboard';
import { Roadmap, Projects, Schedule, Skills, SearchResults } from './components/RoadmapViews';
import { 
  initGoogleClient, 
  signInToGoogle, 
  signOutFromGoogle, 
  saveProgressToDrive, 
  loadProgressFromDrive, 
  recordUserLogin,
  saveToLocal,
  loadFromLocal,
  exportDataAsJSON
} from './services/driveService';

// --- Main App Component ---

enum View {
  DASHBOARD = 'DASHBOARD',
  ROADMAP = 'ROADMAP',
  PROJECTS = 'PROJECTS',
  SCHEDULE = 'SCHEDULE',
  SKILLS = 'SKILLS',
  SEARCH = 'SEARCH'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Roadmap Data
  const [roadmapData, setRoadmapData] = useState<Phase[]>(ROADMAP_DATA);
  
  // State for Google Auth
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error' | 'local'>('idle');

  const isClientConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  // Init Google Client or Local Storage
  useEffect(() => {
    if (isClientConfigured) {
      initGoogleClient(GOOGLE_CLIENT_ID, () => {
        console.log('Google Client Initialized');
      });
    } else {
      // Fallback to local storage init
      const localData = loadFromLocal();
      if (localData) {
        setRoadmapData(localData);
        setSyncStatus('local');
      }
    }
  }, [isClientConfigured]);

  // --- Persistence Logic (Auto-Save) ---
  
  // Debounce save to avoid API spamming
  useEffect(() => {
    if (!roadmapData) return;

    // TEST MODE CHECK: Do not attempt to save to Drive if using Mock User
    if (googleUser?.email === MOCK_USER.email) {
      setSyncStatus('saved');
      return;
    }

    const autoSave = setTimeout(async () => {
      if (googleUser && isClientConfigured) {
        // Cloud Save
        setSyncStatus('syncing');
        try {
          await saveProgressToDrive(roadmapData, googleUser.email);
          setSyncStatus('saved');
        } catch (e) {
          console.error("Auto-save failed", e);
          setSyncStatus('error');
        }
      } else {
        // Local Save
        saveToLocal(roadmapData);
        setSyncStatus('local');
      }
    }, 2000); // Wait 2 seconds after last change before saving

    return () => clearTimeout(autoSave);
  }, [roadmapData, googleUser, isClientConfigured]);

  const handleGoogleSignIn = async () => {
    if (!isClientConfigured) {
      alert("Sign In unavailable. App is running in Local Mode because Google Client ID is not configured.");
      return;
    }

    try {
      const user = await signInToGoogle();
      setGoogleUser(user);
      
      // 1. Record the login for analytics
      await recordUserLogin(user);

      // 2. Load progress on sign in
      setSyncStatus('syncing');
      const data = await loadProgressFromDrive(user.email);
      if (data) {
        setRoadmapData(data);
        setSyncStatus('saved');
      } else {
        // If no data exists, maybe save initial state?
        setSyncStatus('idle');
      }
    } catch (e) {
      console.error("Sign in failed", e);
      setSyncStatus('error');
    }
  };

  const handleGoogleSignOut = () => {
    if (googleUser?.email !== MOCK_USER.email) {
      signOutFromGoogle();
    }
    setGoogleUser(null);
    setSyncStatus('local');
  };

  const handleTestMode = () => {
    setGoogleUser(MOCK_USER);
    setRoadmapData(MOCK_ROADMAP_DATA);
    setSyncStatus('saved');
    setCurrentView(View.DASHBOARD);
  };

  const handleExitTestMode = () => {
    setGoogleUser(null);
    const localData = loadFromLocal();
    setRoadmapData(localData || ROADMAP_DATA);
    setSyncStatus('local');
    setCurrentView(View.DASHBOARD);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      setCurrentView(View.SEARCH);
    } else {
      setCurrentView(View.DASHBOARD);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentView(View.DASHBOARD);
  };

  // --- Data Mutation Logic ---

  const handleToggleCertStatus = useCallback((phaseId: number, certCode: string) => {
    setRoadmapData(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        certs: phase.certs.map(cert => {
          if (cert.code !== certCode) return cert;
          // Rotate status: LOCKED -> IN_PROGRESS -> COMPLETED -> LOCKED
          let nextStatus = Status.LOCKED;
          if (cert.status === Status.LOCKED) nextStatus = Status.IN_PROGRESS;
          else if (cert.status === Status.IN_PROGRESS) nextStatus = Status.COMPLETED;
          else nextStatus = Status.LOCKED;
          return { ...cert, status: nextStatus };
        })
      };
    }));
  }, []);

  const handleToggleProjectStatus = useCallback((phaseId: number, projectTitle: string) => {
    setRoadmapData(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        projects: phase.projects.map(proj => {
          if (proj.title !== projectTitle) return proj;
          let nextStatus = Status.LOCKED;
          if (proj.status === Status.LOCKED) nextStatus = Status.IN_PROGRESS;
          else if (proj.status === Status.IN_PROGRESS) nextStatus = Status.COMPLETED;
          else nextStatus = Status.LOCKED;
          return { ...proj, status: nextStatus };
        })
      };
    }));
  }, []);

  const handleToggleSkill = useCallback((phaseId: number, skillName: string) => {
    setRoadmapData(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        skills: phase.skills.map(skill => {
          if (skill.name !== skillName) return skill;
          return { ...skill, mastered: !skill.mastered };
        })
      };
    }));
  }, []);

  const renderView = () => {
    switch(currentView) {
      case View.DASHBOARD: 
        return <Dashboard 
          onOpenChat={() => setIsChatOpen(true)} 
          data={roadmapData} 
          googleUser={googleUser} 
          onConnect={handleGoogleSignIn} 
          onExport={() => exportDataAsJSON(roadmapData)}
        />;
      case View.ROADMAP: 
        return <Roadmap 
          data={roadmapData} 
          onToggleCertStatus={handleToggleCertStatus} 
        />;
      case View.PROJECTS: 
        return <Projects 
          data={roadmapData} 
          onToggleProjectStatus={handleToggleProjectStatus}
        />;
      case View.SCHEDULE: 
        return <Schedule />;
      case View.SKILLS: 
        return <Skills 
          data={roadmapData} 
          onToggleSkill={handleToggleSkill}
        />;
      case View.SEARCH:
        return <SearchResults 
           data={roadmapData} 
           query={searchQuery}
           onToggleCertStatus={handleToggleCertStatus}
           onToggleProjectStatus={handleToggleProjectStatus}
           onToggleSkill={handleToggleSkill}
        />;
      default: return null;
    }
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setSidebarOpen(false);
        if (view !== View.SEARCH) setSearchQuery('');
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
        currentView === view 
          ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-inter selection:bg-blue-500/30">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[60]
        w-72 bg-slate-900/50 border-r border-white/5 backdrop-blur-xl
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-2xl h-screen
      `}>
        <div className="p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10 flex-shrink-0">
                <Cpu className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-white leading-none tracking-tight">
                Agentic AI
              </h1>
              <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase mt-1">Architect</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search roadmap..." 
               value={searchQuery}
               onChange={handleSearch}
               className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
             />
             {searchQuery && (
               <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                 <X className="w-4 h-4" />
               </button>
             )}
          </div>

          <nav className="space-y-2">
            <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem view={View.ROADMAP} icon={MapIcon} label="Roadmap" />
            <NavItem view={View.PROJECTS} icon={Briefcase} label="Applied Labs" />
            <NavItem view={View.SCHEDULE} icon={Calendar} label="Weekly Schedule" />
            <NavItem view={View.SKILLS} icon={CheckSquare} label="Skills Matrix" />
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 space-y-4 bg-slate-900/30 flex-shrink-0">
            {/* Cloud Sync / Persistence Section */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {isClientConfigured ? 'Cloud Sync' : 'Local Save'}
                  </span>
                  <a 
                    href={`https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-blue-400 transition-colors"
                    title="Open Shared Drive Folder"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {syncStatus === 'syncing' && <div className="flex items-center gap-1 text-blue-400"><RefreshCw className="w-3 h-3 animate-spin" /><span className="text-[10px]">Syncing</span></div>}
                {syncStatus === 'saved' && <div className="flex items-center gap-1 text-emerald-400"><Cloud className="w-3 h-3" /><span className="text-[10px]">Saved</span></div>}
                {syncStatus === 'local' && <div className="flex items-center gap-1 text-orange-400"><HardDrive className="w-3 h-3" /><span className="text-[10px]">Local</span></div>}
                {syncStatus === 'error' && <div className="flex items-center gap-1 text-red-400"><Cloud className="w-3 h-3" /><span className="text-[10px]">Error</span></div>}
              </div>
              
              {googleUser ? (
                <div className="animate-in fade-in">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden border border-white/10">
                        {googleUser.picture ? <img src={googleUser.picture} alt="Avatar" onError={(e) => e.currentTarget.style.display = 'none'} /> : googleUser.name.charAt(0)}
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">{googleUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{googleUser.email}</p>
                     </div>
                  </div>
                  
                  {googleUser.email === MOCK_USER.email ? (
                    <button 
                      onClick={handleExitTestMode}
                      className="w-full py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-900/20"
                    >
                      <LogOut className="w-3 h-3" /> Exit Demo Mode
                    </button>
                  ) : (
                    <button 
                      onClick={handleGoogleSignOut}
                      className="w-full py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                  )}
                  
                  {/* Demo Mode Indicator */}
                  {googleUser.email === MOCK_USER.email && (
                    <div className="mt-2 text-center">
                      <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                        TEST MODE ACTIVE
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {isClientConfigured ? (
                    <button 
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-blue-900/20"
                    >
                      <LogIn className="w-3 h-3" /> Sign In with Google
                    </button>
                  ) : (
                     <div className="text-[10px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-700 mb-2">
                        Progress is saved to your browser automatically.
                     </div>
                  )}
                  
                  <button 
                     onClick={() => exportDataAsJSON(roadmapData)}
                     className="w-full py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-600"
                  >
                     <Download className="w-3 h-3" /> Download Progress
                  </button>

                  {/* Test Mode Trigger */}
                  <button 
                    onClick={handleTestMode}
                    className="w-full py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:text-slate-200"
                  >
                    <PlayCircle className="w-3 h-3" /> Run Demo Mode
                  </button>
                </div>
              )}
            </div>

            {/* Creator Profile Card */}
            <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-xl border border-white/5 hover:bg-slate-800/50 transition-colors group">
                    <div className="relative">
                        {/* Replace src with your actual photo URL */}
                        <img 
                          src="https://ui-avatars.com/api/?name=Upendra+Kumar&background=2563eb&color=fff" 
                          alt="Upendra Kumar" 
                          className="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors object-cover shadow-md"
                          onError={(e) => e.currentTarget.src = 'https://ui-avatars.com/api/?name=Upendra+Kumar&background=2563eb&color=fff'}
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 bg-[#0077b5] rounded-full p-0.5 border border-slate-900">
                            <Linkedin className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Upendra Kumar</span>
                        <a 
                          href="https://www.linkedin.com/in/journeytocloudwithupendra/" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors mt-0.5 font-medium"
                        >
                          Connect <span className="text-slate-600 group-hover:text-blue-400">→</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                    <Cpu className="w-5 h-5 text-white" />
                </div>
                 <div className="flex flex-col">
                     <span className="font-extrabold text-sm leading-none text-slate-100">Agentic AI</span>
                     <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mt-0.5">Architect</span>
                 </div>
             </div>
             <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
             </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-24">
             {renderView()}
          </div>
        </div>
      </main>

      {/* Floating Chat Bot */}
      <MentorChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
};

export default App;