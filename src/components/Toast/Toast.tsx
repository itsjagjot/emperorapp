import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import './Toast.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    text: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (text: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((text: string, type: ToastType = 'success', duration: number = 30000000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, text, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast-popup toast-${toast.type}`}
                        onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    >
                        <span className="toast-icon">
                            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}
                        </span>
                        <span className="toast-text">{toast.text}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
