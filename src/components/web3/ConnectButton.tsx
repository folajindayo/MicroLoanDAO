import React from 'react'

export const ConnectButton = () => {
  return (
    <div className="flex items-center gap-2">
      {/* @ts-expect-error - Web Component */}
      <appkit-button />
    </div>
  )
}
