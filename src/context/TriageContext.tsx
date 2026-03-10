import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, AmbulanceAlert, TriageLevel, Vitals, TriageAnalysis } from '../types';
import { predictTriage } from '../services/geminiService';

interface TriageContextType {
  patients: Patient[];
  history: Patient[];
  alerts: AmbulanceAlert[];
  analyzePatient: (
    name: string,
    age: number,
    arrivalMode: 'Walk-in' | 'Ambulance',
    vitals: Vitals,
    symptoms: string[]
  ) => Promise<TriageAnalysis>;
  addPatient: (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => Patient;
  updatePatientStatus: (id: string, status: Patient['status'], outcome?: string, notes?: string) => void;
  addAlert: (alert: Omit<AmbulanceAlert, 'id' | 'timestamp'>) => void;
  removeAlert: (id: string) => void;
  updateAlertAnalysis: (id: string, analysis: TriageAnalysis) => void;
  savePatientToHistory: (patientId: string) => void;
  addPatientToHistory: (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => void;
  currentAnalysis: TriageAnalysis | null;
  setCurrentAnalysis: (analysis: TriageAnalysis | null) => void;
  currentFormData: any | null;
  setCurrentFormData: (data: any | null) => void;
  loading: boolean;
}

const TriageContext = createContext<TriageContextType | undefined>(undefined);

const INITIAL_HISTORY: Patient[] = [
  {
    id: 'h1',
    patientId: 'P-1024',
    name: 'Anisha Sharma',
    age: 22,
    gender: 'Female',
    bloodGroup: 'B+',
    contactNumber: '+91 98765 43210',
    arrivalMode: 'Walk-in',
    vitals: { heartRate: 72, systolicBP: 120, diastolicBP: 80, spO2: 98, temperature: 36.6, painLevel: 2 },
    symptoms: ['Mild Headache'],
    triageLevel: 'Routine',
    analysis: { triageLevel: 'Routine', priorityScore: 15, severityScore: 10, status: 'Stable', reasoning: [], riskIndicators: [], criticalAlerts: [] },
    timestamp: '2026-01-12T10:30:00Z',
    status: 'Discharged',
    medicalHistory: { chronicDiseases: ['None'], allergies: ['Dust'], medications: ['None'], surgeries: ['None'] },
    outcome: 'Discharged - Routine follow-up',
    doctorNotes: 'Patient presented with mild headache. Vitals normal.'
  },
  {
    id: 'h2',
    patientId: 'P-1024',
    name: 'Anisha Sharma',
    age: 22,
    gender: 'Female',
    bloodGroup: 'B+',
    contactNumber: '+91 98765 43210',
    arrivalMode: 'Walk-in',
    vitals: { heartRate: 88, systolicBP: 135, diastolicBP: 85, spO2: 96, temperature: 37.2, painLevel: 6 },
    symptoms: ['Chest Pain', 'Nausea'],
    triageLevel: 'Urgent',
    analysis: { triageLevel: 'Urgent', priorityScore: 65, severityScore: 45, status: 'Observation', reasoning: [], riskIndicators: [], criticalAlerts: [] },
    timestamp: '2026-02-20T14:15:00Z',
    status: 'Discharged',
    medicalHistory: { chronicDiseases: ['None'], allergies: ['Dust'], medications: ['None'], surgeries: ['None'] },
    outcome: 'Observation - Cardiac enzymes negative',
    doctorNotes: 'Chest pain resolved after antacids. ECG normal.'
  },
  {
    id: 'h3',
    patientId: 'P-1024',
    name: 'Anisha Sharma',
    age: 22,
    gender: 'Female',
    bloodGroup: 'B+',
    contactNumber: '+91 98765 43210',
    arrivalMode: 'Ambulance',
    vitals: { heartRate: 110, systolicBP: 150, diastolicBP: 95, spO2: 92, temperature: 38.5, painLevel: 9 },
    symptoms: ['Breathing Difficulty', 'Severe Chest Pain'],
    triageLevel: 'Emergency',
    analysis: { triageLevel: 'Emergency', priorityScore: 95, severityScore: 85, status: 'Critical', reasoning: [], riskIndicators: [], criticalAlerts: [] },
    timestamp: '2026-03-10T08:00:00Z',
    status: 'Discharged',
    medicalHistory: { chronicDiseases: ['None'], allergies: ['Dust'], medications: ['None'], surgeries: ['None'] },
    outcome: 'Admitted to ICU',
    doctorNotes: 'Acute respiratory distress. Stabilized in ER.'
  }
];

export function TriageProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('medtriage_patients');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('medtriage_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });
  const [alerts, setAlerts] = useState<AmbulanceAlert[]>(() => {
    const saved = localStorage.getItem('medtriage_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TriageAnalysis | null>(null);
  const [currentFormData, setCurrentFormData] = useState<any | null>(null);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('medtriage_patients', JSON.stringify(patients));
    localStorage.setItem('medtriage_history', JSON.stringify(history));
    localStorage.setItem('medtriage_alerts', JSON.stringify(alerts));
  }, [patients, history, alerts]);

  const analyzePatient = async (
    name: string,
    age: number,
    arrivalMode: 'Walk-in' | 'Ambulance',
    vitals: Vitals,
    symptoms: string[]
  ) => {
    setLoading(true);
    try {
      return await predictTriage(name, age, arrivalMode, vitals, symptoms);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => {
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      age,
      gender,
      bloodGroup,
      contactNumber,
      arrivalMode,
      vitals,
      symptoms,
      triageLevel: analysis.triageLevel,
      analysis,
      timestamp: new Date().toISOString(),
      status: 'Waiting',
      medicalHistory: {
        chronicDiseases: symptoms.includes('Fever') ? ['None'] : ['Diabetes Type II'],
        allergies: ['Penicillin'],
        medications: ['Metformin'],
        surgeries: ['Appendectomy (2018)']
      }
    };

    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  const updatePatientStatus = (id: string, status: Patient['status'], outcome?: string, notes?: string) => {
    if (status === 'Discharged' || status === 'In Treatment') {
      const patient = patients.find(p => p.id === id);
      if (patient) {
        setHistory(prev => [...prev, { 
          ...patient, 
          status, 
          outcome: outcome || (status === 'In Treatment' ? 'Under Treatment' : 'Discharged'), 
          doctorNotes: notes || (status === 'In Treatment' ? 'Patient moved to treatment area.' : 'Patient stable.') 
        }]);
        setPatients(prev => prev.filter(p => p.id !== id));
      }
    } else {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status, outcome, doctorNotes: notes } : p));
    }
  };

  const savePatientToHistory = (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (patient) {
      setHistory(prev => [...prev, { ...patient, status: 'Discharged', outcome: 'Record Saved', doctorNotes: 'Manual record save.' }]);
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const addPatientToHistory = (
    name: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other',
    bloodGroup: string,
    contactNumber: string,
    arrivalMode: 'Walk-in' | 'Ambulance', 
    vitals: Vitals, 
    symptoms: string[],
    analysis: TriageAnalysis
  ) => {
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      age,
      gender,
      bloodGroup,
      contactNumber,
      arrivalMode,
      vitals,
      symptoms,
      triageLevel: analysis.triageLevel,
      analysis,
      timestamp: new Date().toISOString(),
      status: 'Discharged',
      outcome: 'Record Saved',
      doctorNotes: 'Direct save to history.',
      medicalHistory: {
        chronicDiseases: ['None'],
        allergies: ['None'],
        medications: ['None'],
        surgeries: ['None']
      }
    };
    setHistory(prev => [...prev, newPatient]);
  };

  const addAlert = (alert: Omit<AmbulanceAlert, 'id' | 'timestamp'>) => {
    const newAlert: AmbulanceAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const updateAlertAnalysis = (id: string, analysis: TriageAnalysis) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, analysis } : a));
  };

  return (
    <TriageContext.Provider value={{ 
      patients, 
      history, 
      alerts, 
      analyzePatient,
      addPatient, 
      updatePatientStatus, 
      savePatientToHistory,
      addPatientToHistory,
      addAlert,
      removeAlert,
      updateAlertAnalysis,
      currentAnalysis,
      setCurrentAnalysis,
      currentFormData,
      setCurrentFormData,
      loading 
    }}>
      {children}
    </TriageContext.Provider>
  );
}

export function useTriage() {
  const context = useContext(TriageContext);
  if (context === undefined) {
    throw new Error('useTriage must be used within a TriageProvider');
  }
  return context;
}
