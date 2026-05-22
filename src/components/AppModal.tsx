import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface AppModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function AppModal({ title, onClose, children }: AppModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-[71] w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-outline-variant/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
