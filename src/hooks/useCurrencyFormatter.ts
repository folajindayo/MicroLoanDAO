import { formatEther } from 'viem'

export function useCurrencyFormatter() {
    const formatETH = (value: bigint | string) => {
        return `${formatEther(BigInt(value))} ETH`
    }
    return { formatETH }
}
