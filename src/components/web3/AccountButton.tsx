import React from 'react'

export const AccountButton = () => {
  return (
    <div className="flex items-center gap-2">
      {/* @ts-expect-error - Web Component */}
      <appkit-account-button />
    </div>
  )
}
