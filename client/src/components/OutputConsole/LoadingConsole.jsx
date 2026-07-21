export default function LoadingConsole() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-[#dcdcaa]">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#dcdcaa]/25 border-t-[#dcdcaa]" />
      <span className="text-sm font-medium">Running...</span>
      <span className="h-1 w-40 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-1/2 animate-pulse rounded-full bg-[#dcdcaa]" /></span>
    </div>
  );
}
