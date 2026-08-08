export default function EmptyConsole() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[#858585]">
      <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 font-mono text-lg text-[#9cdcfe]">›_</span>
      <p className="text-sm font-medium text-[#c5c5c5]">No output yet</p>
      <p className="text-xs">Run your program to see results.</p>
    </div>
  );
}
