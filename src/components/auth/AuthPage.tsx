import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ArrowLeftRight, Sparkles, Repeat, CalendarCheck } from 'lucide-react';

type AuthMode = 'login' | 'register';

const features = [
  { icon: Sparkles, title: 'Smart Matching', desc: 'AI ranks the best swap partners by skills, availability, and preferences.' },
  { icon: Repeat, title: 'Multi-hop Swap Chains', desc: 'When no direct swap exists, we find circular chains that satisfy everyone.' },
  { icon: CalendarCheck, title: 'Real-time Coverage', desc: 'Managers see team coverage live and approve swaps in a click.' },
];

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand hero */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white bg-[#0b1020]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 300px at 80% 0%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(500px 300px at 0% 100%, rgba(139,92,246,0.28), transparent 55%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold">SmartSwap</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Swap shifts,{' '}
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              intelligently.
            </span>
          </h1>
          <p className="mt-4 text-white/70">
            The shift-swapping platform for modern teams — smart matching, multi-hop swap chains,
            and live coverage for managers.
          </p>

          <div className="mt-10 space-y-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="grid place-items-center h-9 w-9 shrink-0 rounded-lg bg-white/10 ring-1 ring-white/15">
                    <Icon className="h-[18px] w-[18px] text-indigo-200" />
                  </div>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-white/60">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} SmartSwap — Revolutionizing workforce scheduling.</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 bg-app">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <ArrowLeftRight className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">SmartSwap</span>
          </div>
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
};
