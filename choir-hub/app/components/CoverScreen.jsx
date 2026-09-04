"use client";

export default function CoverScreen({ onEnter }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8 text-center bg-gradient-to-b from-navydeep via-navy to-navydeep"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <img
        src="/logo-cover.jpg"
        alt="NHAG Choir"
        className="w-full max-w-xs rounded-2xl shadow-2xl mb-10"
      />
      <p className="font-serif italic text-white text-xl mb-1.5">Songs, Setlists &amp; Prayer</p>
      <p className="text-[#b9c3e6] text-sm max-w-xs leading-relaxed mb-12">
        "Sing unto the Lord, all the earth; shew forth from day to day his
        salvation." — 1 Chronicles 16:23
      </p>
      <button
        onClick={onEnter}
        className="bg-white text-navy rounded-full px-9 py-3.5 text-[15px] font-semibold active:scale-95 transition"
      >
        Enter
      </button>
    </div>
  );
}
