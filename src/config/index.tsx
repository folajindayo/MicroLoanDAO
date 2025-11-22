import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, sepolia, hardhat } from '@reown/appkit/networks'
import { getProjectId } from '@/lib/env'

export const projectId = getProjectId()

export const networks = [mainnet, arbitrum, sepolia, hardhat]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
