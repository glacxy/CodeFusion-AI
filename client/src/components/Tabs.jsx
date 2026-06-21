function Tabs({ files, currentFile, onSwitchFile, onDeleteFile }) {
  const fileNames = Object.keys(files);

  return (
    <div className="flex h-10 min-w-0 border-b border-[#2d2d30] bg-[#1e1e1e]">
      <div className="flex min-w-0 flex-1 overflow-x-auto">
        {fileNames.map((fileName) => {
          const isActive = fileName === currentFile;

          return (
            <div
              key={fileName}
              className={`flex h-10 max-w-48 shrink-0 items-center border-r border-[#2d2d30] text-sm ${
                isActive
                  ? "bg-[#1e1e1e] text-white"
                  : "bg-[#2d2d2d] text-[#bdbdbd] hover:bg-[#323233]"
              }`}
            >
              <button
                type="button"
                onClick={() => onSwitchFile(fileName)}
                className="min-w-0 flex-1 truncate px-3 text-left focus:outline-none"
                title={fileName}
              >
                {fileName}
              </button>

              <button
                type="button"
                onClick={() => onDeleteFile(fileName)}
                title="Close and delete file"
                disabled={fileNames.length <= 1}
                className="mr-2 grid h-6 w-6 place-items-center rounded text-[#a6a6a6] hover:bg-[#454545] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                x
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
