export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-ocean-50" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-sand-200/80 bg-white px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-sand-300 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-sand-300 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-sand-300 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
