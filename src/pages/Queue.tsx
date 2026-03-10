import React, { useMemo } from 'react';
import { useTriage } from '../context/TriageContext';
import { TRIAGE_LEVELS } from '../constants';
import { formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle, ChevronRight, AlertCircle, Activity, Heart, Thermometer, Droplets, ShieldAlert, Zap, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export function Queue() {
  const { patients, updatePatientStatus } = useTriage();

  const groupedPatients = useMemo(() => {
    const groups = [
      { id: 'emergency', label: 'Emergency', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', patients: [] as typeof patients },
      { id: 'urgent', label: 'Urgent', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50', patients: [] as typeof patients },
      { id: 'other', label: 'Routine & Self-care', icon: Info, color: 'text-slate-500', bg: 'bg-slate-50', patients: [] as typeof patients },
    ];

    patients.forEach(p => {
      if (p.triageLevel === 'Emergency') groups[0].patients.push(p);
      else if (p.triageLevel === 'Urgent') groups[1].patients.push(p);
      else groups[2].patients.push(p);
    });

    // Sort within groups by timestamp
    groups.forEach(group => {
      group.patients.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    return groups;
  }, [patients]);

  const totalPatients = patients.length;

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Queue</h2>
          <p className="text-slate-500 mt-1">Real-time priority list of patients waiting for assessment.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                DR
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">3 Staff Active</span>
        </div>
      </header>

      {totalPatients > 0 ? (
        <div className="space-y-12">
          {groupedPatients.map((group) => (
            group.patients.length > 0 && (
              <section key={group.id} className="space-y-6">
                <div className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-2xl w-fit border",
                  group.bg,
                  group.id === 'emergency' ? 'border-red-100' : group.id === 'urgent' ? 'border-orange-100' : 'border-slate-200'
                )}>
                  <group.icon className={clsx("w-5 h-5", group.color)} />
                  <h3 className={clsx("text-sm font-black uppercase tracking-widest", group.color)}>
                    {group.label} ({group.patients.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                    {group.patients.map((patient, index) => (
                      <motion.div
                        layout
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-slate-300 transition-all group"
                      >
                        <div className="flex items-stretch">
                          {/* Priority Bar */}
                          <div className={clsx(
                            "w-3",
                            TRIAGE_LEVELS[patient.triageLevel]?.color.split(' ')[0]
                          )} />
                          
                          <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
                            {/* Patient Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-slate-900">{patient.name}</h3>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
                                  {patient.age}Y • {patient.arrivalMode}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  <span>Waiting for {formatDistanceToNow(new Date(patient.timestamp))}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="font-medium text-slate-900">{patient.triageLevel}</span>
                                </div>
                              </div>
                            </div>

                            {/* Vitals Snapshot */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 border-x border-slate-100">
                              <div className="flex flex-col items-center gap-1">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-bold text-slate-900">{patient.vitals.heartRate}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BPM</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-bold text-slate-900">{patient.vitals.systolicBP}/{patient.vitals.diastolicBP}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BP</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Droplets className="w-4 h-4 text-cyan-500" />
                                <span className="text-sm font-bold text-slate-900">{patient.vitals.spO2}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SpO2</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Thermometer className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-bold text-slate-900">{patient.vitals.temperature}°</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temp</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => updatePatientStatus(patient.id, 'In Treatment')}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                              >
                                <span>Treat</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  const outcome = prompt('Enter treatment outcome:', 'Discharged - Stable');
                                  const notes = prompt('Enter doctor notes:', 'Patient treated and discharged.');
                                  if (outcome !== null) {
                                    updatePatientStatus(patient.id, 'Discharged', outcome, notes || undefined);
                                  }
                                }}
                                className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50 rounded-xl transition-all"
                                title="Mark as Discharged"
                              >
                                <CheckCircle className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Queue is Empty</h3>
          <p className="text-slate-400 max-w-xs mt-2">No patients are currently waiting for assessment.</p>
        </motion.div>
      )}
    </div>
  );
}
