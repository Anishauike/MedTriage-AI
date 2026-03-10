import React, { useState, useMemo } from 'react';
import { useTriage } from '../context/TriageContext';
import { TRIAGE_LEVELS } from '../constants';
import { format, parseISO } from 'date-fns';
import { 
  Search, Filter, Download, ChevronRight, User, Calendar, 
  FileText, Activity, Heart, Thermometer, Droplets, 
  AlertCircle, ArrowLeft, Plus, ExternalLink, ShieldAlert,
  Stethoscope, Pill, Scissors, ThermometerIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import { Patient } from '../types';

export function History() {
  const { history } = useTriage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterArrival, setFilterArrival] = useState<string>('All');

  // Group history by patientId to get unique patients
  const patientsList = useMemo(() => {
    const map = new Map<string, Patient[]>();
    history.forEach(visit => {
      const id = visit.patientId || visit.name; // Fallback to name if patientId missing
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(visit);
    });
    return Array.from(map.entries()).map(([id, visits]) => ({
      id,
      latestVisit: visits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0],
      visits: visits.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      totalVisits: visits.length,
      emergencyVisits: visits.filter(v => v.triageLevel === 'Emergency').length
    }));
  }, [history]);

  const filteredPatients = patientsList.filter(p => {
    const matchesSearch = p.latestVisit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'All' || p.latestVisit.triageLevel === filterLevel;
    const matchesArrival = filterArrival === 'All' || p.latestVisit.arrivalMode === filterArrival;
    return matchesSearch && matchesLevel && matchesArrival;
  });

  const selectedPatient = useMemo(() => {
    return patientsList.find(p => p.id === selectedPatientId);
  }, [patientsList, selectedPatientId]);

  // Trend data for charts
  const trendData = useMemo(() => {
    if (!selectedPatient) return [];
    return selectedPatient.visits.map(v => ({
      date: format(parseISO(v.timestamp), 'MMM dd'),
      hr: v.vitals.heartRate,
      spo2: v.vitals.spO2,
      temp: v.vitals.temperature,
      pain: v.vitals.painLevel,
      level: v.triageLevel
    }));
  }, [selectedPatient]);

  if (selectedPatientId && selectedPatient) {
    const p = selectedPatient.latestVisit;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-12"
      >
        <button 
          onClick={() => setSelectedPatientId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Patient List</span>
        </button>

        {/* SECTION 1: PATIENT PROFILE SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row gap-8">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                <p className="text-xl font-black text-slate-900">{p.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient ID</p>
                <p className="text-lg font-bold text-slate-600">{selectedPatient.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                <p className="text-lg font-bold text-slate-900">{p.age}Y / {p.gender}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                <p className="text-lg font-bold text-red-600">{p.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                <p className="text-lg font-bold text-slate-900">{p.contactNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4">Quick Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-black">{selectedPatient.totalVisits}</p>
                <p className="text-[10px] font-bold uppercase opacity-60">Total ER Visits</p>
              </div>
              <div>
                <p className="text-3xl font-black text-red-400">{selectedPatient.emergencyVisits}</p>
                <p className="text-[10px] font-bold uppercase opacity-60">Emergency Cases</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-[10px] font-bold uppercase opacity-60">Last Visit Date</p>
              <p className="text-sm font-bold">{format(parseISO(p.timestamp), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SECTION 2: MEDICAL OVERVIEW */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Medical Overview
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-900">Chronic Diseases</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.medicalHistory.chronicDiseases.map((d, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{d}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-slate-900">Allergies</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.medicalHistory.allergies.map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">{a}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900">Current Medications</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.medicalHistory.medications.map((m, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">{m}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Scissors className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-slate-900">Previous Surgeries</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.medicalHistory.surgeries.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: LAST VISIT SUMMARY */}
            <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-8 space-y-4">
              <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Last Visit Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-indigo-400">Date</span>
                  <span className="text-xs font-black text-indigo-900">{format(parseISO(p.timestamp), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-indigo-400">Triage Level</span>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                    TRIAGE_LEVELS[p.triageLevel]?.color || 'bg-slate-200'
                  )}>{p.triageLevel}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Symptoms</p>
                  <div className="flex flex-wrap gap-1">
                    {p.symptoms.map((s, i) => (
                      <span key={i} className="text-xs font-bold text-indigo-900">• {s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Treatment Provided</p>
                  <p className="text-xs font-bold text-indigo-900">{p.outcome || 'Standard observation and medication.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RISK TREND ANALYSIS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Risk Trend Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-48">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Heart Rate Trend (bpm)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip />
                      <Area type="monotone" dataKey="hr" stroke="#ef4444" fillOpacity={1} fill="url(#colorHr)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-48">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">SpO2 Trend (%)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[80, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="spo2" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSpo2)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-48">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Temperature Trend (°C)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[35, 42]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="temp" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-48">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Pain Level Trend (0-10)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[0, 10]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="pain" stroke="#6366f1" fillOpacity={1} fill="url(#colorPain)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SECTION 7: QUICK ACTIONS */}
            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20">
                <ExternalLink className="w-4 h-4" />
                View Full Medical Record
              </button>
              <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Visit
              </button>
              <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Export Patient Report
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: VISIT HISTORY TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Visit Timeline / History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Triage Level</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Symptoms</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrival</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPatient.visits.slice().reverse().map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900">{format(parseISO(visit.timestamp), 'MMM dd, yyyy')}</p>
                      <p className="text-[10px] font-bold text-slate-400">{format(parseISO(visit.timestamp), 'HH:mm')}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        TRIAGE_LEVELS[visit.triageLevel]?.color || 'bg-slate-200'
                      )}>
                        {visit.triageLevel}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {visit.symptoms.map((s, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-600">{visit.arrivalMode}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-900">{visit.outcome || 'Discharged'}</p>
                      <p className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{visit.doctorNotes}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECTION 6: SEARCH AND FILTER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Patient History</h2>
          <p className="text-slate-500 mt-1">Clinical patient record dashboard and visit history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Name or ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all w-full md:w-64 shadow-sm"
            />
          </div>
          <select 
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
          >
            <option>All Levels</option>
            <option>Emergency</option>
            <option>Urgent</option>
            <option>Routine</option>
            <option>Self-care</option>
          </select>
          <select 
            value={filterArrival}
            onChange={e => setFilterArrival(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
          >
            <option>All Arrival</option>
            <option>Walk-in</option>
            <option>Ambulance</option>
          </select>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Triage</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visits</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-sm">
                          {p.latestVisit.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{p.latestVisit.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.latestVisit.age}Y • {p.latestVisit.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-600">{p.id}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        TRIAGE_LEVELS[p.latestVisit.triageLevel]?.color || 'bg-slate-200'
                      )}>
                        {p.latestVisit.triageLevel}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{p.totalVisits}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Visits</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedPatientId(p.id)}
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FileText className="w-16 h-16 text-slate-100" />
                      <p className="text-slate-400 font-bold">No patient records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
