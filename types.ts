
export type UserRole = 'doctor' | 'patient' | 'researcher';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosisStatus: 'Healthy' | 'Stroke' | 'Pending' | 'At Risk';
  createdAt: Date;
}

export interface AcousticBiomarkers {
  jitter: number; // Frequency instability
  shimmer: number; // Amplitude instability
  hnr: number; // Harmonics-to-Noise Ratio
  speakingRate: number; // Syllables per second
  pauseFrequency: number; // Pauses per minute
}

export interface AudioTest {
  id: string;
  userId: string;
  patientId: string;
  audioUrl: string;
  strokeProbability: number;
  predictedLabel: 'Stroke' | 'Healthy';
  biomarkers: AcousticBiomarkers;
  reasoning: string;
  modelVersion: string;
  deviceType: 'web' | 'mobile';
  createdAt: Date;
}

export interface InferenceResult {
  strokeProbability: number;
  predictedLabel: 'Stroke' | 'Healthy';
  biomarkers: AcousticBiomarkers;
  reasoning: string;
}
