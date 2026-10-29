import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied() {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">403 - Access Denied</h1>
      <p className="text-sm text-slate-500 max-w-md mt-2">
        You do not possess the required RBAC authority to view or interact with this resource.
      </p>

      {user && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          Logged in as: <strong className="text-slate-900">{user.username}</strong> | Assigned Roles:{' '}
          <span className="font-mono text-indigo-600">{user.roles?.join(', ')}</span>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link to="/dashboard" className="btn btn-primary flex items-center gap-2 text-sm">
          <Home className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}