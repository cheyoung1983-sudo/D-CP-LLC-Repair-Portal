import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogIn, LogOut, Shield, ChevronDown } from 'lucide-react';
import { getAuth0Config, getUserRoles, isTechnicianOrAdmin } from '../lib/auth0Rbac';
import Auth0RbacModal from './Auth0RbacModal';

function ActiveAuth0UserButton() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl" />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <button
          onClick={() => loginWithRedirect()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200"
          title="Sign in with Auth0"
        >
          <LogIn className="w-3.5 h-3.5 text-blue-600" />
          <span>Sign In</span>
        </button>
        <Auth0RbacModal isOpen={isRbacModalOpen} onClose={() => setIsRbacModalOpen(false)} />
      </>
    );
  }

  const roles = getUserRoles(user);
  const isTech = isTechnicianOrAdmin(user);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="w-6 h-6 rounded-lg object-cover border border-blue-400"
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px]">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <span className="max-w-[100px] truncate">{user.nickname || user.name || 'Account'}</span>
          {isTech && (
            <span className="w-2 h-2 rounded-full bg-blue-400 ring-2 ring-blue-500/20" title="Technician Role" />
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
          >
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name || user.nickname}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {roles.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setDropdownOpen(false);
                setIsRbacModalOpen(true);
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              Role & Claims Inspector
            </button>

            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <Auth0RbacModal isOpen={isRbacModalOpen} onClose={() => setIsRbacModalOpen(false)} />
    </>
  );
}

function StandbyAuth0UserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200"
        title="Auth0 Access"
      >
        <Shield className="w-3.5 h-3.5 text-blue-600" />
        <span>Auth0 Access</span>
      </button>
      <Auth0RbacModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export const Auth0UserButton: React.FC = () => {
  const { isConfigured } = getAuth0Config();

  if (!isConfigured) {
    return <StandbyAuth0UserButton />;
  }

  return <ActiveAuth0UserButton />;
};

export default Auth0UserButton;
