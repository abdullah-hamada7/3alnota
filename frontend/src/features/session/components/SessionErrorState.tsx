'use client';

import React from 'react';
import Link from 'next/link';

import { Search, ShieldAlert, AlertOctagon } from 'lucide-react';

interface SessionErrorStateProps {
  title?: string;
  message?: string;
  type?: 'not-found' | 'unauthorized' | 'server-error';
}

const SessionErrorState: React.FC<SessionErrorStateProps> = ({ 
  title, 
  message, 
  type = 'server-error' 
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'not-found':
        return {
          t: 'الحسبة دي مش موجودة!',
          m: 'دورنا عليها في كل حتة وملقناش حاجة. اتأكد من اللينك يا معلم.',
          icon: <Search size={64} className="text-slate-400" />
        };
      case 'unauthorized':
        return {
          t: 'مش بتاعتك يا بطل',
          m: 'اللينك ده تقريباً للمعاينة بس، أو محتاج إذن دخول.',
          icon: <ShieldAlert size={64} className="text-error" />
        };
      default:
        return {
          t: 'في حاجة باظت!',
          m: 'السيرفر شكله مهنج شوية، جرب ريفريش كدة وربنا يسهل.',
          icon: <AlertOctagon size={64} className="text-error" />
        };
    }
  };

  const content = {
    t: title || getDefaultContent().t,
    m: message || getDefaultContent().m,
    icon: getDefaultContent().icon
  };

  return (
    <div className="error-state-container premium-entrance">
      <div className="mb-6 select-none">
        {content.icon}
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
        {content.t}
      </h1>
      <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
        {content.m}
      </p>
      <div className="flex gap-4">
        <Link 
          href="/"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200"
        >
          نبدأ حسبة جديدة؟
        </Link>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all duration-200"
        >
          جرب تاني
        </button>
      </div>
    </div>
  );
};

export default SessionErrorState;
