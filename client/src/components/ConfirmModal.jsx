import React from 'react';

export default function ConfirmModal({ isOpen, onConfirm, onCancel, orderName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeIn_0.15s_ease]">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗑️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Order?</h3>
          <p className="text-sm text-gray-500 mt-2">
            You're about to delete the order for{' '}
            <span className="font-semibold text-gray-700">{orderName}</span>.
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
