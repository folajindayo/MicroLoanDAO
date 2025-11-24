import { formatEther } from 'viem'
import { useCallback } from 'react'

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
    const formatETH = useCallback((value: bigint | string) => {
        try {
            return `${formatEther(BigInt(value))} ETH`
        } catch {
            return '0.00 ETH'
        }
    }, [])

    return { formatETH }
}

