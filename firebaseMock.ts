
import { UserProfile, Patient, AudioTest, UserRole } from "../types";
import { classifySpeech } from "./geminiService";

// State simulation
let currentUser: UserProfile | null = JSON.parse(localStorage.getItem('nv_user') || 'null');
let patients: Patient[] = JSON.parse(localStorage.getItem('nv_patients') || '[]');
let audioTests: AudioTest[] = JSON.parse(localStorage.getItem('nv_tests') || '[]');

// Initial seeds if empty
if (patients.length === 0) {
  patients = [
    { id: 'p1', name: 'John Doe', age: 65, gender: 'Male', diagnosisStatus: 'Stroke', createdAt: new Date('2024-01-10') },
    { id: 'p2', name: 'Jane Smith', age: 72, gender: 'Female', diagnosisStatus: 'Healthy', createdAt: new Date('2024-01-15') },
    { id: 'p3', name: 'Michael Chen', age: 58, gender: 'Male', diagnosisStatus: 'Pending', createdAt: new Date('2024-02-01') },
  ];
}

export const mockAuth = {
  signIn: async (email: string, pass: string, role: UserRole): Promise<UserProfile> => {
    currentUser = { id: `u_${Math.random().toString(36).substr(2, 5)}`, name: email.split('@')[0], email, role, createdAt: new Date() };
    localStorage.setItem('nv_user', JSON.stringify(currentUser));
    return currentUser;
  },
  signOut: () => { 
    currentUser = null; 
    localStorage.removeItem('nv_user');
  },
  getCurrentUser: () => currentUser,
};

export const mockFirestore = {
  getPatients: async () => patients,
  addPatient: async (p: Omit<Patient, 'id' | 'createdAt'>) => {
    if (currentUser?.role === 'researcher') throw new Error("Unauthorized");
    const newPatient = { ...p, id: 'PAT-' + Math.random().toString(36).substr(2, 6).toUpperCase(), createdAt: new Date() };
    patients = [newPatient, ...patients];
    localStorage.setItem('nv_patients', JSON.stringify(patients));
    return newPatient;
  },
  getTests: async () => audioTests,
  updatePatientStatus: (patientId: string, status: Patient['diagnosisStatus']) => {
    patients = patients.map(p => p.id === patientId ? { ...p, diagnosisStatus: status } : p);
    localStorage.setItem('nv_patients', JSON.stringify(patients));
  }
};

export const mockStorage = {
  uploadAudio: async (blob: Blob, patientId: string): Promise<AudioTest> => {
    if (currentUser?.role === 'researcher') throw new Error("Unauthorized");
    
    const audioUrl = URL.createObjectURL(blob);
    const result = await classifySpeech(blob);
    
    const newTest: AudioTest = {
      id: 'TEST-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      userId: currentUser?.id || 'anon',
      patientId,
      audioUrl,
      strokeProbability: result.strokeProbability,
      predictedLabel: result.predictedLabel,
      biomarkers: result.biomarkers,
      reasoning: result.reasoning,
      modelVersion: 'v3.0-flash-pro-inference',
      deviceType: 'web',
      createdAt: new Date(),
    };
    
    audioTests = [newTest, ...audioTests];
    localStorage.setItem('nv_tests', JSON.stringify(audioTests));
    
    mockFirestore.updatePatientStatus(patientId, result.predictedLabel);
    return newTest;
  }
};
