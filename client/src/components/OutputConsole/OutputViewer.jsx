import { useEffect, useRef, useState } from "react";
import EmptyConsole from "./EmptyConsole";
import LoadingConsole from "./LoadingConsole";

const hasProblems = (output) => Boolean(output?.compileOutput || output?.stderr || output?.error);

const ProblemCard = ({ title, tone, children }) => (
  <article className={`rounded-md border p-3 ${tone.container}`}>
    <h3 className={`mb-2 text-xs font-semibold uppercase tracking-wide ${tone.text}`}>{title}</h3>
    <pre className={`whitespace-pre-wrap break-words text-sm leading-6 ${tone.text}`}>{children}</pre>
  </article>
);

export default function OutputViewer({ activeTab, output, isRunning }) {
  const viewportRef = useRef(null);
  const [followOutput, setFollowOutput] = useState(true);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (followOutput && viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [output, isRunning, activeTab, followOutput]);

  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setFollowOutput(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 24);
  };

  if (!output && !isRunning) return <EmptyConsole />;
  if (isRunning) return <LoadingConsole />;

  const problems = hasProblems(output);
  const rawOutput = [
    output.stdout && `stdout:\n${output.stdout}`,
    output.compileOutput && `compile error:\n${output.compileOutput}`,
    output.stderr && `stderr:\n${output.stderr}`,
    output.error && !output.stderr && `error:\n${output.error}`,
  ].filter(Boolean).join("\n\n");

  return (
    <div ref={viewportRef} onScroll={onScroll} className="h-full overflow-auto p-4 font-mono text-sm leading-6">
      {activeTab === "Problems" ? (
        problems ? <div className="space-y-3">
          {output.compileOutput && <ProblemCard title="Compile Error" tone={{ container: "border-[#ce9178]/30 bg-[#ce9178]/[0.06]", text: "text-[#ce9178]" }}>{output.compileOutput}</ProblemCard>}
          {output.stderr && <ProblemCard title="Runtime Error" tone={{ container: "border-[#f48771]/30 bg-[#f48771]/[0.06]", text: "text-[#f48771]" }}>{output.stderr}</ProblemCard>}
          {output.error && !output.stderr && <ProblemCard title="Internal Error" tone={{ container: "border-[#f48771]/30 bg-[#f48771]/[0.06]", text: "text-[#f48771]" }}>{output.error}</ProblemCard>}
        </div> : <p className="text-[#858585]">No problems reported.</p>
      ) : activeTab === "Terminal" ? (
        <pre className="whitespace-pre-wrap break-words text-[#d4d4d4]">{rawOutput || "(no terminal output)"}</pre>
      ) : <div className="space-y-4">
        {output.stdout && <section><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#9cdcfe]">stdout</p><pre className="whitespace-pre-wrap break-words text-[#f4f4f4]">{output.stdout}</pre></section>}
        {output.compileOutput && <section><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#ce9178]">Compile Error</p><pre className="whitespace-pre-wrap break-words text-[#ce9178]">{output.compileOutput}</pre></section>}
        {output.stderr && <section><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#f48771]">Runtime Error</p><pre className="whitespace-pre-wrap break-words text-[#f48771]">{output.stderr}</pre></section>}
        {output.error && !output.stderr && <section><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#f48771]">System Error</p><pre className="whitespace-pre-wrap break-words text-[#f48771]">{output.error}</pre></section>}
        {!rawOutput && <p className="text-[#858585]">Program finished with no output.</p>}
      </div>}
    </div>
  );
}
