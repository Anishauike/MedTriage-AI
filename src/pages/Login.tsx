import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password. Try admin@hospital.com / admin123');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-red-500 p-3 rounded-2xl mb-4 shadow-lg shadow-red-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">MedTriage AI</h1>
            <p className="text-slate-400 text-sm mt-1">Hospital Emergency Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <input
                  required
                  type="email"
                  placeholder="admin@hospital.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Login to Portal</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Demo Credentials</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Admin</span>
                <span className="text-[10px] font-mono text-slate-500">admin@hospital.com / admin123</span>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Reception</span>
                <span className="text-[10px] font-mono text-slate-500">receptionist@hospital.com / receptionist123</span>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Ambulance</span>
                <span className="text-[10px] font-mono text-slate-500">ambulance@hospital.com / ambulance123</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
