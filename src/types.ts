export type TriageLevel = 'Emergency' | 'Urgent' | 'Routine' | 'Self-care';

export interface Vitals {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spO2: number;
  temperature: number;
  painLevel: number; // 0-10
}

export interface RiskIndicator {
  label: string;
  value: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface TriageAnalysis {
  triageLevel: TriageLevel;
  priorityScore: number; // 0-100%
  severityScore: number; // 0-100
  status: string; // e.g., "Moderate Risk"
  reasoning: string[]; // Bullet points
  riskIndicators: RiskIndicator[];
  criticalAlerts: string[];
}

export interface Patient {
  id: string;
  patientId: string; // Unique ID for the person
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  contactNumber: string;
  arrivalMode: 'Walk-in' | 'Ambulance';
  vitals: Vitals;
  symptoms: string[];
  triageLevel: TriageLevel;
  analysis: TriageAnalysis;
  timestamp: string;
  status: 'Waiting' | 'In Treatment' | 'Discharged';
  medicalHistory: {
    chronicDiseases: string[];
    allergies: string[];
    medications: string[];
    surgeries: string[];
  };
  doctorNotes?: string;
  outcome?: string;
}

export interface AmbulanceAlert {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  contactNumber: string;
  vitals: Vitals;
  symptoms: string[];
  eta: string;
  location: string;
  condition: string;
  severity: 'Critical' | 'Severe' | 'Moderate';
  analysis?: TriageAnalysis;
  timestamp: string;
}

export type UserRole = 'Admin' | 'Receptionist' | 'Ambulance Controller';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
