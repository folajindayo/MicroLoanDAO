import { formatEther } from 'viem'

export function useCurrencyFormatter() {
  const formatETH = (value: string | bigint) => {
    try {
      return `${formatEther(BigInt(value))} ETH`
    } catch {
      return '0 ETH'
    }
  }
  return { formatETH }
}
