import { formatEther } from 'viem'

/**
 * Custom hook for formatting cryptocurrency values.
 * @returns {Object} Object containing formatETH function
 */
export function useCurrencyFormatter() {
    /**
     * Formats Wei to ETH string.
     * @param {bigint | string} value - Value in Wei
     * @returns {string} Formatted string (e.g. "1.5 ETH")
     */
    const formatETH = (value: bigint | string) => {
        return `${formatEther(BigInt(value))} ETH`
    }
    return { formatETH }
}
