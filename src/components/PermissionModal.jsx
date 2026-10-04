import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound, AlertCircle } from 'lucide-react';

const PERMISSION_CODE = '296201#';

const PermissionModal = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleClose = useCallback(() => {
    setError('');
    setCode('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() === PERMISSION_CODE) {
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('Incorrect permission code. Please try again.');
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  };

  const modalContent = (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: '380px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} style={{ color: 'var(--text-secondary)' }} />
            <span id="permission-modal-title" className="modal-title">
              Confirmation Required
            </span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '1rem', padding: '1.25rem 1.5rem' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}
            >
              Please enter the 7-digit permission code to continue:
            </p>

            <div>
              <input
                ref={inputRef}
                type="text"
                className="form-input"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter permission code..."
                autoComplete="off"
                spellCheck="false"
                style={{
                  letterSpacing: '1px',
                  fontWeight: '600',
                  borderColor: error ? '#ff3b30' : undefined
                }}
              />
              {error && (
                <div className="validation-error" style={{ marginTop: '0.5rem' }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-glass"
              onClick={handleClose}
              style={{ minWidth: '80px', height: '38px', padding: '0 1rem' }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minWidth: '95px', height: '38px', padding: '0 1.25rem' }}
            >
              Confirmed
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PermissionModal;
