'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'giapha_auth';
const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_PASSWORD;

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(true); // TODO: re-enable password gate
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setUnlocked(true);
  }, []);

  useEffect(() => {
    if (!unlocked) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [unlocked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!CORRECT_PASSWORD || input === CORRECT_PASSWORD) {
      // Blur input first to dismiss iOS keyboard, then wait for viewport to reset
      inputRef.current?.blur();
      setTimeout(() => {
        window.scrollTo(0, 0);
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setUnlocked(true);
      }, 100);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
      inputRef.current?.focus();
    }
  };

  if (unlocked) return children;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative bg-[#fffbeb] border-2 border-amber-800 rounded-lg shadow-2xl px-8 py-8 w-[90%] max-w-sm flex flex-col items-center gap-5 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        style={{
          backgroundImage: "url('/giapha/bg_parchment.png')",
          backgroundSize: 'cover',
        }}
      >
        {/* Decorative poles */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />

        {/* Title */}
        <div className="flex flex-col items-center gap-1 select-none">
          <span className="text-xs font-bold text-amber-900/60 uppercase tracking-[0.3em]">Gia Phả Dòng Họ</span>
          <span className="text-2xl font-black text-red-800 font-spectral tracking-wider drop-shadow-sm uppercase">
            Nguyễn Thanh Tộc
          </span>
        </div>

        <div className="w-full h-px bg-amber-900/20" />

        {/* Lock icon */}
        <div className="flex flex-col items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-900/70">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-amber-900/50 font-spectral italic">Trang này được bảo vệ</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Nhập mật khẩu..."
              autoComplete="current-password"
              className={`w-full px-4 py-2.5 rounded border-2 bg-[#fffbeb]/80 text-amber-900 placeholder-amber-900/30 font-spectral text-sm outline-none transition-all duration-200 ${
                error
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-amber-900/30 focus:border-amber-800'
              }`}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 text-center font-bold animate-fade-in">
              Mật khẩu không đúng
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded bg-amber-900 hover:bg-amber-800 text-[#fffbeb] font-black font-spectral uppercase tracking-widest text-sm shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Vào Xem
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
