"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Confirm Save</h3>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-300 mb-6">
          Are you sure you want to save these changes? This will update the
          prize inventory and probabilities.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-3 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
