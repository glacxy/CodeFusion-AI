function Explorer({
  files,
  currentFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onSwitchFile,
}) {
  const fileNames = Object.keys(files);

  const handleCreateFile = () => {
    const fileName = window.prompt("New file name");
    if (fileName) onCreateFile(fileName);
  };

  const handleRenameFile = (fileName) => {
    const newFileName = window.prompt("Rename file", fileName);
    if (newFileName && newFileName !== fileName) {
      onRenameFile(fileName, newFileName);
    }
  };

  const handleDeleteFile = (fileName) => {
    if (fileNames.length <= 1) return;

    const shouldDelete = window.confirm(`Delete ${fileName}?`);
    if (shouldDelete) onDeleteFile(fileName);
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[#2d2d30] bg-[#252526] text-[#cccccc]">
      <div className="flex h-10 items-center justify-between border-b border-[#2d2d30] px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#bbbbbb]">
          Explorer
        </span>
        <button
          type="button"
          onClick={handleCreateFile}
          title="New File"
          className="grid h-7 w-7 place-items-center rounded hover:bg-[#37373d] focus:outline-none focus:ring-2 focus:ring-[#007acc]"
        >
          +
        </button>
      </div>

      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#858585]">
        Files
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto">
        {fileNames.map((fileName) => {
          const isActive = fileName === currentFile;

          return (
            <div
              key={fileName}
              className={`group flex h-9 items-center gap-2 px-3 text-sm ${
                isActive
                  ? "bg-[#37373d] text-white"
                  : "text-[#cccccc] hover:bg-[#2a2d2e]"
              }`}
            >
              <button
                type="button"
                onClick={() => onSwitchFile(fileName)}
                className="min-w-0 flex-1 truncate text-left focus:outline-none"
                title={fileName}
              >
                <span className="mr-2 text-[#c5c5c5]">JS</span>
                {fileName}
              </button>

              <button
                type="button"
                onClick={() => handleRenameFile(fileName)}
                title="Rename File"
                className="hidden h-6 w-6 place-items-center rounded text-xs text-[#cccccc] hover:bg-[#454545] group-hover:grid"
              >
                R
              </button>

              <button
                type="button"
                onClick={() => handleDeleteFile(fileName)}
                title="Delete File"
                disabled={fileNames.length <= 1}
                className="hidden h-6 w-6 place-items-center rounded text-xs text-[#cccccc] hover:bg-[#454545] disabled:cursor-not-allowed disabled:opacity-40 group-hover:grid"
              >
                X
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Explorer;
