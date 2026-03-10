import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MapPin, Clock, AlertTriangle, Plus, X, Siren, ShieldAlert, Activity, User, Heart, Thermometer, Droplets, Loader2, BrainCircuit, UserPlus } from 'lucide-react';
import { INITIAL_VITALS, SYMPTOMS_LIST } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

export function AmbulanceAlerts() {
  const { alerts, addAlert, analyzePatient, addPatient, removeAlert, updateAlertAnalysis, setCurrentAnalysis, setCurrentFormData, loading: contextLoading } = useTriage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingAlertId, setAnalyzingAlertId] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState({
    patientName: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    contactNumber: '',
    ...INITIAL_VITALS,
    symptoms: [] as string[],
    location: '',
    condition: '',
    severity: 'Moderate' as 'Critical' | 'Severe' | 'Moderate',
    eta: '10 mins'
  });

  const toggleSymptom = (symptom: string) => {
    setNewAlert(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const vitals = {
      heartRate: newAlert.heartRate,
      systolicBP: newAlert.systolicBP,
      diastolicBP: newAlert.diastolicBP,
      spO2: newAlert.spO2,
      temperature: newAlert.temperature,
      painLevel: newAlert.painLevel
    };

    // Ambulance Controller only sends the alert
    if (user?.role === 'Ambulance Controller') {
      addAlert({
        patientName: newAlert.patientName,
        age: Number(newAlert.age),
        gender: newAlert.gender,
        bloodGroup: newAlert.bloodGroup,
        contactNumber: newAlert.contactNumber,
        vitals,
        symptoms: newAlert.symptoms,
        location: newAlert.location,
        condition: newAlert.condition,
        severity: newAlert.severity,
        eta: newAlert.eta,
      });
      setShowAdd(false);
      return;
    }

    // Admin or others might still want the old behavior or we can unify
    setIsAnalyzing(true);
    try {
      const analysis = await analyzePatient(
        newAlert.patientName,
        Number(newAlert.age),
        'Ambulance',
        vitals,
        newAlert.symptoms
      );

      addAlert({
        patientName: newAlert.patientName,
        age: Number(newAlert.age),
        gender: newAlert.gender,
        bloodGroup: newAlert.bloodGroup,
        contactNumber: newAlert.contactNumber,
        vitals,
        symptoms: newAlert.symptoms,
        location: newAlert.location,
        condition: newAlert.condition,
        severity: newAlert.severity,
        eta: newAlert.eta,
        analysis
      });

      setShowAdd(false);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeAlert = async (alert: any) => {
    setAnalyzingAlertId(alert.id);
    try {
      const analysis = await analyzePatient(
        alert.patientName,
        alert.age,
        'Ambulance',
        alert.vitals,
        alert.symptoms
      );
      updateAlertAnalysis(alert.id, analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzingAlertId(null);
    }
  };

  const handleAddToQueue = (alert: any) => {
    if (!alert.analysis) return;
    
    addPatient(
      alert.patientName,
      alert.age,
      alert.gender,
      alert.bloodGroup,
      alert.contactNumber,
      'Ambulance',
      alert.vitals,
      alert.symptoms,
      alert.analysis
    );
    removeAlert(alert.id);
    navigate('/queue');
  };

  const canCreateAlert = user?.role === 'Admin' || user?.role === 'Ambulance Controller';
  const canAnalyze = user?.role === 'Admin' || user?.role === 'Receptionist';

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Ambulance Alerts</h2>
          <p className="text-slate-500 mt-1">Real-time tracking of incoming emergency vehicles.</p>
        </div>
        {canCreateAlert && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Alert</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <motion.div
                layout
                key={alert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-red-200 transition-all group relative flex flex-col"
              >
                <div className={clsx(
                  "h-2 w-full",
                  alert.severity === 'Critical' ? 'bg-red-600' : alert.severity === 'Severe' ? 'bg-orange-500' : 'bg-yellow-400'
                )} />
                
                <div className="p-6 space-y-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "p-2 rounded-lg",
                        alert.severity === 'Critical' ? 'bg-red-50 text-red-600' : alert.severity === 'Severe' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'
                      )}>
                        <Siren className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{alert.patientName}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{alert.age}Y • {alert.gender} • {alert.severity} Priority</p>
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{alert.eta}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {alert.analysis && canAnalyze && (
                      <div className={clsx(
                        "p-3 rounded-xl border mb-3",
                        alert.analysis.triageLevel === 'Emergency' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                      )}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <BrainCircuit className="w-3 h-3 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Triage</span>
                          </div>
                          <span className={clsx(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                            alert.analysis.triageLevel === 'Emergency' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                          )}>
                            {alert.analysis.triageLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 italic">"{alert.analysis.reasoning[0]}"</p>
                      </div>
                    )}
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                        <p className="text-slate-700 font-medium">{alert.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Activity className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Vitals / Symptoms</p>
                        <p className="text-slate-700 font-medium">HR: {alert.vitals.heartRate} | SpO2: {alert.vitals.spO2}%</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alert.symptoms.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                  {canAnalyze && !alert.analysis && (
                    <button 
                      onClick={() => handleAnalyzeAlert(alert)}
                      disabled={analyzingAlertId === alert.id}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/10"
                    >
                      {analyzingAlertId === alert.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4" />
                          <span>Perform AI Analysis</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {canAnalyze && alert.analysis && (
                    <button 
                      onClick={() => handleAddToQueue(alert)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/10"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add to Emergency Queue</span>
                    </button>
                  )}

                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Alerted {formatDistanceToNow(new Date(alert.timestamp))} ago
                    </span>
                    <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Active Alerts</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2">Incoming ambulance alerts will appear here in real-time.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Alert Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold">New Emergency Alert</h3>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                {/* Patient Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm">Patient Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                      <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.patientName} onChange={e => setNewAlert({ ...newAlert, patientName: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label>
                      <input required type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.age} onChange={e => setNewAlert({ ...newAlert, age: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                      <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.gender} onChange={e => setNewAlert({ ...newAlert, gender: e.target.value as any })}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</label>
                      <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.bloodGroup} onChange={e => setNewAlert({ ...newAlert, bloodGroup: e.target.value })}>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Vitals */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-sm">Clinical Vitals</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HR</label>
                      <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.heartRate} onChange={e => setNewAlert({ ...newAlert, heartRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sys BP</label>
                      <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.systolicBP} onChange={e => setNewAlert({ ...newAlert, systolicBP: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO2</label>
                      <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.spO2} onChange={e => setNewAlert({ ...newAlert, spO2: Number(e.target.value) })} />
                    </div>
                  </div>
                </section>

                {/* Symptoms */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <h4 className="text-sm">Symptoms</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS_LIST.slice(0, 12).map(symptom => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                          newAlert.symptoms.includes(symptom) ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-500"
                        )}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Alert Details */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <Siren className="w-4 h-4 text-red-500" />
                    <h4 className="text-sm">Alert Details</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                      <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.location} onChange={e => setNewAlert({ ...newAlert, location: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</label>
                        <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.severity} onChange={e => setNewAlert({ ...newAlert, severity: e.target.value as any })}>
                          <option>Moderate</option><option>Severe</option><option>Critical</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ETA</label>
                        <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newAlert.eta} onChange={e => setNewAlert({ ...newAlert, eta: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </section>
                
                <button 
                  disabled={isAnalyzing}
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing & Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      <span>Broadcast Alert</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
