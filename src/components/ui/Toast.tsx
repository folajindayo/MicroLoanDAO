import { ReactNode } from 'react'

interface ToastProps {
  message: string
  onClose: () => void
}

export const Toast = ({ message, onClose }: ToastProps) => {
  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2" role="alert">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 font-bold hover:text-red-100">&times;</button>
    </div>
  )
}
