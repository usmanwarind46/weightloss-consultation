import React from 'react';
import Link from 'next/link';

const Error = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2FA] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#4565BF]/10 bg-white p-8 shadow-[0_18px_55px_rgba(69,101,191,0.10)]">
        <div className="flex flex-col items-center text-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4565BF]/10 text-[#4565BF]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <h1 className="inter-bold-font text-[22px] text-slate-900">Page Not Found</h1>
          <p className="inter-reg-font text-[14px] text-slate-500 max-w-md">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. Please return to the consultation flow.
          </p>
          <Link href="/">
            <button className="inter-medium-font rounded-xl bg-[#4565BF] px-5 py-3 text-white transition-colors hover:bg-[#3550a0]">
              Go to Homepage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;
