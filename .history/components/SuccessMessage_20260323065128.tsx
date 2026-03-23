import React, { useEffect } from 'react'

interface SuccessMessageProps {
  isVisible: boolean
  message: string
  onDismiss: () => void
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  isVisible,
  message,
  onDismiss,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
        <span className="text-2xl">✓</span>
        <div>
          <p className="font-semibold">Success!</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  )
}
