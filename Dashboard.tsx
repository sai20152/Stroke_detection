
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Patient, AudioTest } from '../types';

interface DashboardProps {
  patients: Patient[];
  tests: AudioTest[];
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, tests }) => {
  const stats = [
    { label: 'Total Patients', value: patients.length, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Tests Conducted', value: tests.length, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Stroke Detected', value: tests.filter(t => t.predictedLabel === 'Stroke').length, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Model Accuracy', value: '94.2%', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  const chartData = [
    { name: 'Mon', tests: 4, detected: 1 },
    { name: 'Tue', tests: 7, detected: 2 },
    { name: 'Wed', tests: 5, detected: 3 },
    { name: 'Thu', tests: 8, detected: 2 },
    { name: 'Fri', tests: 12, detected: 4 },
    { name: 'Sat', tests: 6, detected: 1 },
    { name: 'Sun', tests: 3, detected: 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Test Volume (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="tests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="detected" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Detection Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="detected" stroke="#f43f5e" strokeWidth={3} dot={{r: 4, fill: '#f43f5e'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {tests.slice(0, 5).map((test) => {
            const patient = patients.find(p => p.id === test.patientId);
            return (
              <div key={test.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${test.predictedLabel === 'Stroke' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="font-medium">{patient?.name || 'Unknown Patient'}</p>
                    <p className="text-xs text-slate-500">{new Date(test.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    test.predictedLabel === 'Stroke' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {test.predictedLabel} ({(test.strokeProbability * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
