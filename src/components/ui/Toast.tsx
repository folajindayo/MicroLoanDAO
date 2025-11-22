import { useEffect, useState } from 'react'

export function Toast({ message, type = 'error', onClose }: { message: string, type?: 'error' | 'success', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {message}
    </div>
  )
}

