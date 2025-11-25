import { renderHook } from '@testing-library/react'

import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter'

describe('useCurrencyFormatter', () => {
  it('formats ETH correctly', () => {
    const { result } = renderHook(() => useCurrencyFormatter())
    
    expect(result.current.formatETH('1000000000000000000')).toBe('1 ETH')
    expect(result.current.formatETH('500000000000000000')).toBe('0.5 ETH')
  })

  it('handles zero correctly', () => {
    const { result } = renderHook(() => useCurrencyFormatter())
    expect(result.current.formatETH('0')).toBe('0 ETH')
  })
})

