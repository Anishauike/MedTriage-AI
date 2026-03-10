import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { INITIAL_VITALS, TRIAGE_LEVELS, SYMPTOMS_LIST } from '../constants';
import { 
  Activity, User, ClipboardList, AlertCircle, Loader2, 
  Siren, CheckCircle2, AlertTriangle, XCircle, 
  ChevronRight, Save, PlusCircle, Heart, Thermometer, Droplets,
  Clock, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Label
} from 'recharts';

export function Dashboard() {
  const { 
    analyzePatient, addPatient, addPatientToHistory, 
    alerts, removeAlert, loading,
    currentAnalysis, setCurrentAnalysis,
    currentFormData, setCurrentFormData
  } = useTriage();
  
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToQueue, setIsAddedToQueue] = useState(false);
  
  const [formData, setFormData] = useState(currentFormData || {
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    contactNumber: '',
    arrivalMode: 'Walk-in' as 'Walk-in' | 'Ambulance',
    ...INITIAL_VITALS,
    symptoms: [] as string[]
  });
  
  const result = currentAnalysis;

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const analysis = await analyzePatient(
      formData.name,
      Number(formData.age),
      formData.arrivalMode,
      {
        heartRate: formData.heartRate,
        systolicBP: formData.systolicBP,
        diastolicBP: formData.diastolicBP,
        spO2: formData.spO2,
        temperature: formData.temperature,
        painLevel: formData.painLevel
      },
      formData.symptoms
    );
    setCurrentAnalysis(analysis);
    setCurrentFormData(formData);
    setIsSaved(false);
    setIsAddedToQueue(false);
  };

  const handleAddToQueue = () => {
    if (result) {
      addPatient(
        formData.name,
        Number(formData.age),
        formData.gender,
        formData.bloodGroup,
        formData.contactNumber,
        formData.arrivalMode,
        {
          heartRate: formData.heartRate,
          systolicBP: formData.systolicBP,
          diastolicBP: formData.diastolicBP,
          spO2: formData.spO2,
          temperature: formData.temperature,
          painLevel: formData.painLevel
        },
        formData.symptoms,
        result
      );
      setIsAddedToQueue(true);
    }
  };

  const handleSave = () => {
    if (result) {
      addPatientToHistory(
        formData.name,
        Number(formData.age),
        formData.gender,
        formData.bloodGroup,
        formData.contactNumber,
        formData.arrivalMode,
        {
          heartRate: formData.heartRate,
          systolicBP: formData.systolicBP,
          diastolicBP: formData.diastolicBP,
          spO2: formData.spO2,
          temperature: formData.temperature,
          painLevel: formData.painLevel
        },
        formData.symptoms,
        result
      );
      setIsSaved(true);
    }
  };

  const handleAlertToQueue = async (alert: any) => {
    let analysis = alert.analysis;
    
    if (!analysis) {
      analysis = await analyzePatient(
        alert.patientName,
        alert.age,
        'Ambulance',
        alert.vitals,
        alert.symptoms
      );
    }
    
    // Auto-add to queue for ambulance alerts
    addPatient(
      alert.patientName,
      alert.age,
      alert.gender,
      alert.bloodGroup,
      alert.contactNumber,
      'Ambulance',
      alert.vitals,
      alert.symptoms,
      analysis
    );
    
    removeAlert(alert.id);
    setCurrentAnalysis(analysis);
    setCurrentFormData({
      name: alert.patientName,
      age: alert.age,
      gender: alert.gender,
      bloodGroup: alert.bloodGroup,
      contactNumber: alert.contactNumber,
      arrivalMode: 'Ambulance',
      ...alert.vitals,
      symptoms: alert.symptoms
    });
    setIsSaved(false);
    setIsAddedToQueue(true);
  };

  const resetForm = () => {
    setCurrentAnalysis(null);
    setCurrentFormData(null);
    setIsSaved(false);
    setIsAddedToQueue(false);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'O+',
      contactNumber: '',
      arrivalMode: 'Walk-in',
      ...INITIAL_VITALS,
      symptoms: []
    });
  };

  // Data for vitals bar chart
  const vitalsData = result ? [
    { name: 'HR', value: formData.heartRate, full: 200, unit: 'bpm' },
    { name: 'SpO2', value: formData.spO2, full: 100, unit: '%' },
    { name: 'Temp', value: formData.temperature, full: 42, unit: '°C' },
    { name: 'Pain', value: formData.painLevel, full: 10, unit: '/10' },
    { name: 'Sys BP', value: formData.systolicBP, full: 220, unit: 'mmHg' },
    { name: 'Dia BP', value: formData.diastolicBP, full: 120, unit: 'mmHg' },
  ] : [];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Intake</h2>
          <p className="text-slate-500 mt-1">Clinical analysis panel for emergency triage decisions.</p>
        </div>
        {result && (
          <button 
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>New Intake</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Patient Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-indigo-500" />
                  <h3>Patient Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label>
                    <input
                      required
                      type="number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.contactNumber}
                      onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrival Mode</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.arrivalMode}
                      onChange={e => setFormData({ ...formData, arrivalMode: e.target.value as any })}
                    >
                      <option>Walk-in</option>
                      <option>Ambulance</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Vitals */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <h3>Clinical Vitals</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.heartRate}
                      onChange={e => setFormData({ ...formData, heartRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Systolic BP</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.systolicBP}
                      onChange={e => setFormData({ ...formData, systolicBP: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diastolic BP</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.diastolicBP}
                      onChange={e => setFormData({ ...formData, diastolicBP: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO2 (%)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.spO2}
                      onChange={e => setFormData({ ...formData, spO2: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.temperature}
                      onChange={e => setFormData({ ...formData, temperature: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pain Level (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.painLevel}
                      onChange={e => setFormData({ ...formData, painLevel: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </section>

              {/* Symptoms */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
                  <ClipboardList className="w-5 h-5 text-orange-500" />
                  <h3>Presenting Symptoms</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SYMPTOMS_LIST.map(symptom => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all text-left",
                        formData.symptoms.includes(symptom)
                          ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      <div className={clsx(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        formData.symptoms.includes(symptom) ? "bg-orange-500 border-orange-500" : "bg-white border-slate-300"
                      )}>
                        {formData.symptoms.includes(symptom) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      {symptom}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-200">
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Analyzing Clinical Data...</span>
                  </>
                ) : (
                  <>
                    <Siren className="w-6 h-6" />
                    <span>Predict Triage</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Result & Analysis */}
        <div className="lg:col-span-5 space-y-6">
          {/* Incoming Alerts Section */}
          {alerts.length > 0 && !result && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                <Siren className="w-4 h-4 animate-pulse" />
                Active Ambulance Alerts ({alerts.length})
              </h3>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={alert.id} 
                    className="bg-white border-l-4 border-red-500 rounded-2xl p-4 shadow-sm border border-slate-200 flex justify-between items-center group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-slate-900">{alert.patientName}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{alert.age}Y • {alert.gender}</span>
                        {alert.analysis && (
                          <span className={clsx(
                            "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                            alert.analysis.triageLevel === 'Emergency' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                          )}>
                            {alert.analysis.triageLevel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.eta}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {alert.location}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAlertToQueue(alert)}
                      className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-xl transition-all"
                      title="Add to Queue"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Triage Decision Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className={clsx(
                    "p-8 text-center space-y-2",
                    TRIAGE_LEVELS[result.triageLevel as keyof typeof TRIAGE_LEVELS]?.color || 'bg-slate-100'
                  )}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Triage Level</p>
                    <h4 className="text-4xl font-black">{result.triageLevel}</h4>
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase opacity-70">Priority Score</p>
                        <p className="text-xl font-black">{result.priorityScore}%</p>
                      </div>
                      <div className="w-px h-8 bg-current opacity-20" />
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase opacity-70">Status</p>
                        <p className="text-xl font-black">{result.status}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Severity Score Meter */}
                  <div className="p-8 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Severity Score</p>
                        <p className="text-2xl font-black text-slate-900">{result.severityScore} <span className="text-sm text-slate-400 font-bold">/ 100</span></p>
                      </div>
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        result.severityScore > 75 ? "bg-red-100 text-red-600" : result.severityScore > 40 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {result.status}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.severityScore}%` }}
                        className={clsx(
                          "h-full transition-all",
                          result.severityScore > 75 ? "bg-red-600" : result.severityScore > 40 ? "bg-orange-500" : "bg-emerald-500"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Reasoning */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Clinical Analysis
                  </h3>
                  <ul className="space-y-4">
                    {result.reasoning.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-3">
                  {!isAddedToQueue ? (
                    <button 
                      onClick={handleAddToQueue}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Send to Queue
                    </button>
                  ) : (
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-indigo-700 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Added to Queue
                    </div>
                  )}
                  
                  {!isSaved ? (
                    <button 
                      onClick={handleSave}
                      className="w-full py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Save Patient Record
                    </button>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Record Saved to History
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 text-sm max-w-[200px] font-medium">
                  Complete the patient intake form to generate a clinical triage analysis.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Panel: Visualization & Alerts */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Vitals Visualization */}
            <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Vitals Visualization
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vitalsData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] font-bold shadow-xl">
                              {payload[0].value} {payload[0].payload.unit}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {vitalsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Indicators
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {result.riskIndicators.map((risk: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        risk.status === 'Normal' ? 'bg-emerald-500' : risk.status === 'High' || risk.status === 'Low' ? 'bg-orange-500' : 'bg-red-600'
                      )} />
                      <span className="text-xs font-bold text-slate-700">{risk.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{risk.value}</span>
                      {risk.status === 'Normal' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="lg:col-span-3">
              {result.criticalAlerts.length > 0 ? (
                <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-200 h-full space-y-6">
                  <div className="flex items-center gap-3 text-red-600">
                    <XCircle className="w-8 h-8 animate-pulse" />
                    <h3 className="text-lg font-black uppercase tracking-tighter">Critical Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    {result.criticalAlerts.map((alert: string, i: number) => (
                      <div key={i} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-red-100 text-xs font-bold text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {alert}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Recommendation</p>
                    <p className="text-sm font-bold text-red-900">Immediate emergency attention required.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 p-8 rounded-3xl border-2 border-emerald-200 h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">No Critical Threats</h3>
                    <p className="text-xs text-emerald-700 font-medium mt-1">Patient vitals are within manageable ranges.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
