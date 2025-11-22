'use client'

import { wagmiAdapter, projectId, networks } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { hardhat } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

const queryClient = new QueryClient()

const metadata = {
  name: 'MicroLoan DAO',
  description: 'Decentralized Microloans',
  url: 'https://microloan-dao.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: hardhat,
  metadata: metadata,
  features: {
    analytics: true
  }
})

export default function AppKitProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
