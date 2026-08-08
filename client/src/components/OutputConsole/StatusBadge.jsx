const STATUS_STYLES = {
  Running: "border-[#dcdcaa]/40 bg-[#dcdcaa]/10 text-[#dcdcaa]",
  Success: "border-[#4ec9b0]/40 bg-[#4ec9b0]/10 text-[#4ec9b0]",
  "Compile Error": "border-[#ce9178]/40 bg-[#ce9178]/10 text-[#ce9178]",
  "Runtime Error": "border-[#f48771]/40 bg-[#f48771]/10 text-[#f48771]",
  "Time Limit Exceeded": "border-[#dcdcaa]/40 bg-[#dcdcaa]/10 text-[#dcdcaa]",
  "Memory Limit Exceeded": "border-[#c586c0]/40 bg-[#c586c0]/10 text-[#c586c0]",
  "Internal Error": "border-[#f48771]/40 bg-[#f48771]/10 text-[#f48771]",
};

const getExecutionStatus = (output, isRunning) => {
  if (isRunning) return "Running";
  if (!output) return null;

  const text = `${output.status || ""} ${output.error || ""} ${output.stderr || ""}`.toLowerCase();
  if (text.includes("time limit") || text.includes("timeout")) return "Time Limit Exceeded";
  if (text.includes("memory limit") || text.includes("out of memory")) return "Memory Limit Exceeded";
  if (output.compileOutput || text.includes("compilation")) return "Compile Error";
  if (output.status === "Accepted" || output.success === true && !output.stderr) return "Success";
  if (text.includes("runtime")) return "Runtime Error";
  return "Internal Error";
};

export default function StatusBadge({ output, isRunning }) {
  const status = getExecutionStatus(output, isRunning);
  if (!status) return null;

  const icon = status === "Running" ? "◌" : status === "Success" ? "●" : "●";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      <span className={status === "Running" ? "animate-spin" : ""}>{icon}</span>
      {status === "Running" ? "Running..." : status}
    </span>
  );
}
