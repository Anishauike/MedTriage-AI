import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, Shield, Mail, User as UserIcon, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { clsx } from 'clsx';

export function UserManagement() {
  const { users, addUser, removeUser, user: currentUser } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Receptionist' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(newUser);
    setShowAdd(false);
    setNewUser({ name: '', email: '', role: 'Receptionist' });
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 mt-1">Manage hospital staff access and roles.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">ID: {u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600 font-medium">{u.email}</td>
                <td className="px-8 py-5">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    u.role === 'Admin' ? "bg-red-100 text-red-600" : u.role === 'Receptionist' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  {u.id !== currentUser?.id && (
                    <button 
                      onClick={() => removeUser(u.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  <UserPlus className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-bold">Add New Staff Member</h3>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      required
                      type="text"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      required
                      type="email"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <select
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    >
                      <option value="Admin">System Admin</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Ambulance Controller">Ambulance Controller</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create User Account</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
