import { useEffect, useMemo, useRef, useState } from "react";
import ConsoleTabs from "./ConsoleTabs";
import ConsoleToolbar from "./ConsoleToolbar";
import ExecutionStats from "./ExecutionStats";
import OutputViewer from "./OutputViewer";
import StatusBadge from "./StatusBadge";

const MIN_HEIGHT = 180;
const MAX_HEIGHT = 560;
const DEFAULT_HEIGHT = 280;

const createReport = (output, language, timestamp) => [
  `Status: ${output?.status || "Not run"}`,
  `Language: ${output?.displayName || language || "—"}`,
  `Execution Time: ${output?.runtime !== undefined ? `${output.runtime} ms` : "—"}`,
  `Memory: ${output?.memory !== undefined ? `${output.memory} MB` : "—"}`,
  `Timestamp: ${timestamp?.toLocaleString() || "—"}`,
  "",
  output?.stdout && `STDOUT\n${output.stdout}`,
  output?.compileOutput && `COMPILE ERROR\n${output.compileOutput}`,
  output?.stderr && `STDERR\n${output.stderr}`,
  output?.error && !output.stderr && `ERROR\n${output.error}`,
].filter(Boolean).join("\n\n");

export default function OutputConsole({ output, isRunning, language, timestamp, onClear, onRerun }) {
  const [activeTab, setActiveTab] = useState("Output");
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState(() => Number(localStorage.getItem("codefusion-console-height")) || DEFAULT_HEIGHT);
  const resizingRef = useRef(false);

  const report = useMemo(() => createReport(output, language, timestamp), [output, language, timestamp]);
  const problemCount = Number(Boolean(output?.compileOutput)) + Number(Boolean(output?.stderr || output?.error));

  useEffect(() => { localStorage.setItem("codefusion-console-height", String(height)); }, [height]);

  useEffect(() => {
    const onMove = (event) => {
      if (!resizingRef.current) return;
      setHeight(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, window.innerHeight - event.clientY - 16)));
    };
    const onUp = () => { resizingRef.current = false; document.body.style.userSelect = ""; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, []);

  const copy = async () => { if (report) await navigator.clipboard?.writeText(report); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([report], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url; link.download = "execution-output.txt"; link.click(); URL.revokeObjectURL(url);
  };

  const panelHeight = expanded ? "min(70vh, 560px)" : `${height}px`;
  return (
    <section className="relative flex shrink-0 flex-col overflow-hidden rounded-t-xl border border-white/10 bg-[#1e1e1e] shadow-[0_-12px_32px_rgba(0,0,0,0.2)]" style={{ height: collapsed ? "42px" : panelHeight, transition: "height 180ms ease" }}>
      {!collapsed && <div onPointerDown={() => { resizingRef.current = true; document.body.style.userSelect = "none"; }} className="absolute inset-x-0 top-0 z-10 h-1 cursor-ns-resize hover:bg-[#007fd4]" aria-label="Resize output console" />}
      <header className="flex h-[42px] shrink-0 items-center justify-between border-b border-white/10 bg-[#252526]/90 backdrop-blur">
        <div className="flex min-w-0 items-center"><ConsoleTabs activeTab={activeTab} onChange={setActiveTab} problemCount={problemCount} /><StatusBadge output={output} isRunning={isRunning} /></div>
        <ConsoleToolbar canCopy={Boolean(output)} canClear={Boolean(output)} collapsed={collapsed} expanded={expanded} onCopy={copy} onClear={onClear} onDownload={download} onExpand={() => setExpanded((value) => !value)} onCollapse={() => setCollapsed((value) => !value)} onRerun={onRerun} isRunning={isRunning} />
      </header>
      {!collapsed && <div className="flex min-h-0 flex-1 flex-col"><ExecutionStats output={output} language={language} timestamp={timestamp} /><div className="min-h-0 flex-1"><OutputViewer activeTab={activeTab} output={output} isRunning={isRunning} /></div></div>}
    </section>
  );
}
