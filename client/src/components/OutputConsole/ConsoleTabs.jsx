const tabs = ["Output", "Problems", "Terminal"];

export default function ConsoleTabs({ activeTab, onChange, problemCount }) {
  return (
    <div className="flex min-w-0" role="tablist" aria-label="Output console">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onChange(tab)}
          className={`relative px-3 py-2.5 text-xs font-medium transition ${activeTab === tab ? "bg-white/5 text-white" : "text-[#a6a6a6] hover:bg-white/5 hover:text-white"}`}
        >
          {tab}
          {tab === "Problems" && problemCount > 0 && (
            <span className="ml-1.5 rounded-full bg-[#f48771]/20 px-1.5 py-0.5 text-[10px] text-[#f48771]">{problemCount}</span>
          )}
          {activeTab === tab && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#007fd4]" />}
        </button>
      ))}
    </div>
  );
}
