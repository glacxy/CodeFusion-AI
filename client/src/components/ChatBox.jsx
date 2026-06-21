function ChatBox({
  messages,
  message,
  onMessageChange,
  onSendMessage,
  isSocketConnected,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSendMessage();
  };

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-[#2d2d30] bg-[#252526] text-[#cccccc]">
      <div className="flex h-10 items-center justify-between border-b border-[#2d2d30] px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#bbbbbb]">
          Chat
        </span>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isSocketConnected ? "bg-[#4ec9b0]" : "bg-[#f14c4c]"
          }`}
          title={isSocketConnected ? "Connected" : "Disconnected"}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-[#858585]">No messages yet.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={`${msg.socketId || "message"}-${msg.createdAt || index}`}
              className="rounded bg-[#2d2d30] px-3 py-2 text-sm leading-relaxed text-[#eeeeee]"
            >
              <div className="mb-1 truncate text-[11px] uppercase tracking-wide text-[#858585]">
                {msg.socketId ? msg.socketId.slice(0, 8) : "User"}
              </div>
              <div className="break-words">{msg.message}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#2d2d30] p-3">
        <textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Type message..."
          rows={3}
          className="h-24 w-full resize-none rounded border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-sm text-white outline-none placeholder:text-[#858585] focus:border-[#007acc]"
        />

        <button
          type="submit"
          className="mt-3 h-9 w-full rounded bg-[#0e639c] text-sm font-medium text-white hover:bg-[#1177bb] focus:outline-none focus:ring-2 focus:ring-[#007acc]"
        >
          Send
        </button>
      </form>
    </aside>
  );
}

export default ChatBox;
