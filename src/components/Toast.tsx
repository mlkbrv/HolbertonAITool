interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-6 py-3 bg-primary text-white rounded-full shadow-lg text-sm font-semibold flex items-center gap-4 pointer-events-auto">
      <span>{message}</span>
      <button type="button" onClick={onClose} className="opacity-80 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}
