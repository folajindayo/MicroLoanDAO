import React from 'react'

export const NetworkSwitch = () => {
  return (
    <div className="flex items-center gap-2">
      {/* @ts-expect-error - Web Component */}
      <appkit-network-button />
    </div>
  )
}
