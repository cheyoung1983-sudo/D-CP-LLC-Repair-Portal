import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, User, Key, Lock, CheckCircle2, Copy, Check } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuth0Config, getUserRoles, isTechnicianOrAdmin } from '../lib/auth0Rbac';

interface Auth0RbacModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Auth0RbacModal: React.FC<Auth0RbacModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
  const { domain, clientId, isConfigured } = getAuth0Config();
  const [copiedToken, setCopiedToken] = React.useState(false);

  if (!isOpen) return null;

  const roles = getUserRoles(user);
  const isTech = isTechnicianOrAdmin(user);

  const handleCopySub = () => {
    if (user?.sub) {
      navigator.clipboard.writeText(user.sub);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Identity & RBAC Access</h3>
                <p className="text-xs text-slate-300">Auth0 Enterprise Authentication & Roles</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Status overview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Auth Status</div>
                  <div className="text-sm font-black text-slate-900">
                    {isAuthenticated ? 'Authenticated Active Session' : isConfigured ? 'Guest / Not Authenticated' : 'Auth0 Unbound (Standby)'}
                  </div>
                </div>
              </div>
              {isAuthenticated ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
                  Guest
                </span>
              )}
            </div>

            {/* Profile Info */}
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="w-14 h-14 rounded-2xl border-2 border-blue-400 object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate">{user.name || 'User'}</h4>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {roles.map((r, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Claims</div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-slate-400" /> Subject (ID)
                      </span>
                      <button
                        onClick={handleCopySub}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono font-bold"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedToken ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 break-all text-slate-800">
                      {user.sub}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 font-semibold mb-1">Email Verified</div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {user.email_verified ? (
                          <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified</>
                        ) : (
                          <><Lock className="w-4 h-4 text-amber-500" /> Unverified</>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-slate-500 font-semibold mb-1">Role Tier</div>
                      <div className="font-bold text-slate-900">
                        {isTech ? '⚡ Technician / Lead' : '👤 Customer'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Sign in to D&CP Lab Portal</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Log in with your Auth0 account to access technician diagnostics, lab workflows, and repair authorizations.
                  </p>
                </div>
                <button
                  onClick={() => loginWithRedirect()}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  Log In with Auth0
                </button>
              </div>
            )}

            {/* Tenant details */}
            <div className="p-4 bg-slate-100/60 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-700">Auth0 Environment Configuration:</div>
              <div className="flex justify-between text-slate-600">
                <span>Domain:</span>
                <span className="font-mono">{domain || 'Not configured in env (using standby)'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Client ID:</span>
                <span className="font-mono">{clientId ? `${clientId.slice(0, 8)}...` : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors"
              >
                Log Out
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Auth0RbacModal;
