
import React, { useState } from 'react';
import { Patient, UserRole } from '../types';

interface PatientListProps {
  patients: Patient[];
  userRole: UserRole;
  onAddPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => void;
  onSelectPatient: (p: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, userRole, onAddPatient, onSelectPatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [newPatient, setNewPatient] = useState({ name: '', age: 0, gender: 'Male', diagnosisStatus: 'Pending' as Patient['diagnosisStatus'] });

  const filtered = patients.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  const isReadOnly = userRole === 'researcher';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPatient(newPatient);
    setIsModalOpen(false);
    setNewPatient({ name: '', age: 0, gender: 'Male', diagnosisStatus: 'Pending' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search patients by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            Add New Patient
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Patient Identity</th>
              <th className="px-6 py-4 font-semibold">Demographics</th>
              <th className="px-6 py-4 font-semibold">Gender</th>
              <th className="px-6 py-4 font-semibold">Diagnostic Status</th>
              <th className="px-6 py-4 font-semibold text-right">Records</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? filtered.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{patient.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{patient.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{patient.age} yrs</td>
                <td className="px-6 py-4 text-slate-600">{patient.gender}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                    patient.diagnosisStatus === 'Healthy' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    patient.diagnosisStatus === 'Stroke' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {patient.diagnosisStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="text-blue-600 font-bold text-sm hover:underline px-4 py-2 rounded-lg group-hover:bg-blue-50 transition-colors"
                  >
                    View History →
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No patients found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 scale-in-center">
            <h3 className="text-xl font-bold mb-2">Register New Patient</h3>
            <p className="text-sm text-slate-500 mb-6">Enter clinical profile details for diagnostic tracking.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Legal Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Robert Wilson"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Current Age</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                    value={newPatient.age || ''}
                    onChange={(e) => setNewPatient({...newPatient, age: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Gender</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-Binary</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
