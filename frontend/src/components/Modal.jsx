import React from 'react';
import { Button } from '../ui';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative max-w-md mx-4">
        {title && (
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
        )}

        <div className="mb-4">
          {children}
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="absolute top-3 right-3 px-2 py-1"
        >
          ✕
        </Button>
      </div>
    </div>
  );
};

export default Modal;