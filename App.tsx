
import React, { useState, useEffect } from 'react';
import { mockAuth, mockFirestore } from './services/firebaseMock';
import { UserProfile, Patient, AudioTest, UserRole } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { TestManagement } from './components/TestManagement';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(mockAuth.getCurrentUser());
  const [activeView, setActiveView] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<AudioTest[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [authData, setAuthData] = useState({ email: '', password: '', role: 'doctor' as UserRole });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [p, t] = await Promise.all([
          mockFirestore.getPatients(),
          mockFirestore.getTests()
        ]);
        setPatients(p);
        setTests(t);
      } catch (err) {
        console.error("Failed to load records:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) loadData();
    else setIsLoading(false);
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const userProfile = await mockAuth.signIn(authData.email, authData.password, authData.role);
    setUser(userProfile);
  };

  const handleAddPatient = async (p: Omit<Patient, 'id' | 'createdAt'>) => {
    try {
      const newP = await mockFirestore.addPatient(p);
      setPatients(prev => [newP, ...prev]);
    } catch (err) {
      alert("Error: Only Doctors can register new patients.");
    }
  };

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setActiveView('patient-detail');
  };

  const handleAddTest = (test: AudioTest) => {
    setTests(prev => [test, ...prev]);
    // Synchronize local patients state for instant UI update
    setPatients(prev => prev.map(p => p.id === test.patientId ? {...p, diagnosisStatus: test.predictedLabel} : p));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-black uppercase tracking-widest text-xs">Synchronizing Neuro-Data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl shadow-blue-500/30">N</div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">NeuroVoice</h1>
            <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Vocal Stroke Detection Platform</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Clinical ID</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                placeholder="clinician@hospital.org"
                value={authData.email}
                onChange={e => setAuthData({...authData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Secure Key</label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                placeholder="••••••••"
                value={authData.password}
                onChange={e => setAuthData({...authData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Authorization Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(['doctor', 'researcher', 'patient'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAuthData({...authData, role: r})}
                    className={`py-3 px-1 rounded-xl text-[10px] font-black border capitalize tracking-widest transition-all ${
                      authData.role === r ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 mt-6 active:scale-95"
            >
              Access Neural Dashboard
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
             <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Clinical Bridge</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <button className="w-full py-4 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              <span className="font-bold text-slate-700 text-sm">Sign in with Institutional Google Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard patients={patients} tests={tests} />;
      case 'patients':
        return <PatientList patients={patients} userRole={user.role} onAddPatient={handleAddPatient} onSelectPatient={handleSelectPatient} />;
      case 'patient-detail':
        return selectedPatient ? (
          <TestManagement 
            patient={selectedPatient} 
            tests={tests.filter(t => t.patientId === selectedPatient.id)} 
            userRole={user.role}
            onTestAdded={handleAddTest}
            onBack={() => setActiveView('patients')}
          />
        ) : null;
      case 'tests':
        return (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-black text-slate-800">Global Test Registry</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Cross-Patient Classification Feed</p>
               </div>
               <div className="text-right">
                 <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{tests.length} Records</span>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.15em] font-black">
                  <tr>
                    <th className="px-8 py-5">Analysis Timestamp</th>
                    <th className="px-8 py-5">Subject ID</th>
                    <th className="px-8 py-5">Stroke Prob.</th>
                    <th className="px-8 py-5">Classification</th>
                    <th className="px-8 py-5">Engine Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tests.map(test => (
                    <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-xs font-bold text-slate-600">{new Date(test.createdAt).toLocaleString()}</td>
                      <td className="px-8 py-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">{test.patientId}</td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 w-12 bg-slate-100 rounded-full">
                            <div 
                              className={`h-full rounded-full ${test.strokeProbability > 0.6 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${test.strokeProbability * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{(test.strokeProbability * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${test.predictedLabel === 'Stroke' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {test.predictedLabel}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-[10px] font-bold text-slate-300">{test.modelVersion}</td>
                    </tr>
                  ))}
                  {tests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No classification logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white p-16 rounded-[2.5rem] shadow-sm border border-slate-100 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
            <div className="w-32 h-32 bg-blue-50 border-4 border-white shadow-xl rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-black text-blue-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{user.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-10">{user.email}</p>
            <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto text-left">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Access Tier</p>
                <p className="font-black text-lg capitalize text-slate-800">{user.role}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Onboarded</p>
                <p className="font-black text-lg text-slate-800">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onClick={() => { mockAuth.signOut(); setUser(null); }}
              className="mt-12 px-10 py-4 bg-rose-50 text-rose-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-rose-100 transition-colors"
            >
              Terminate Session
            </button>
          </div>
        );
      default:
        return <Dashboard patients={patients} tests={tests} />;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
