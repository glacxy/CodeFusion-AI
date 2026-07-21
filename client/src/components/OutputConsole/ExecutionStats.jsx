export default function ExecutionStats({ output, language, timestamp }) {
  if (!output) return null;

  const items = [
    ["Time", output.runtime !== undefined ? `${(output.runtime / 1000).toFixed(2)} s` : "—"],
    ["Memory", output.memory !== undefined ? `${output.memory} MB` : "—"],
    ["Language", `${output.displayName || language}${output.version ? ` ${output.version}` : ""}`],
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/5 bg-[#202020]/90 px-4 py-2.5">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-baseline gap-2 text-xs">
          <span className="text-[#858585]">{label}</span>
          <span className="font-mono text-[#d4d4d4]">{value}</span>
        </div>
      ))}
      {timestamp && <span className="ml-auto text-[11px] text-[#6a6a6a]">{timestamp.toLocaleTimeString()}</span>}
    </div>
  );
}
