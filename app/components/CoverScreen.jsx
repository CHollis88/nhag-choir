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
      <p className="text-[#b9c3e6] text-sm max-w-xs leading-relaxed mb-2">
        "Praise him with the sound of the trumpet: praise him with the
        psaltery and harp. Praise him with the timbrel and dance: praise him
        with stringed instruments and organs."
      </p>
      <p className="text-[#b9c3e6] text-xs mb-12">— Psalm 150:3-4 (KJV)</p>
      <button
        onClick={onEnter}
        className="bg-white text-navy rounded-full px-9 py-3.5 text-[15px] font-semibold active:scale-95 transition"
      >
        Enter
      </button>
    </div>
  );
}
