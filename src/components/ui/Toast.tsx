import { clsx } from 'clsx'

interface ToastProps {
    /** Message to display in the toast */
    message: string
    /** Function to call when closing the toast */
    onClose: () => void
    /** Type of toast notification */
    type?: 'success' | 'error' | 'info'
}

export function Toast({ message, onClose, type = 'error' }: ToastProps) {
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type]

    return (
        <div 
            className={clsx(
                "fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 z-50",
                bgColor
            )}
            role="alert"
        >
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 font-bold hover:opacity-80" aria-label="Close">
                ×
            </button>
        </div>
    )
}

