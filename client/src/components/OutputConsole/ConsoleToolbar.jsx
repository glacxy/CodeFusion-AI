const ToolButton = ({ label, icon, onClick, disabled }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className="grid h-7 w-7 place-items-center rounded text-sm text-[#c5c5c5] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
  >
    {icon}
  </button>
);

export default function ConsoleToolbar({ canCopy, canClear, collapsed, expanded, onCopy, onClear, onDownload, onExpand, onCollapse, onRerun, isRunning }) {
  return (
    <div className="flex items-center gap-0.5 px-2">
      <ToolButton label="Copy Output" icon="⧉" onClick={onCopy} disabled={!canCopy} />
      <ToolButton label="Clear Console" icon="⌫" onClick={onClear} disabled={!canClear} />
      <ToolButton label="Download Output" icon="⇩" onClick={onDownload} disabled={!canCopy} />
      <span className="mx-1 h-4 w-px bg-white/10" />
      <ToolButton label={expanded ? "Restore Console" : "Expand Console"} icon={expanded ? "↙" : "↗"} onClick={onExpand} />
      <ToolButton label={collapsed ? "Show Console" : "Collapse Console"} icon={collapsed ? "▴" : "▾"} onClick={onCollapse} />
      <ToolButton label="Re-run" icon="↻" onClick={onRerun} disabled={isRunning} />
    </div>
  );
}
