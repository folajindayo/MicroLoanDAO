import { render, screen } from '@testing-library/react'
import { useCurrencyFormatter } from '../src/hooks/useCurrencyFormatter'

// Test hook via a component since hooks can't be tested directly easily without wrapper in simple setup
function TestComponent({ value }: { value: string }) {
    const { formatETH } = useCurrencyFormatter()
    return <div>{formatETH(BigInt(value))}</div>
}

describe('useCurrencyFormatter', () => {
  it('formats wei to ETH', () => {
    render(<TestComponent value="1000000000000000000" />) // 1 ETH
    expect(screen.getByText('1 ETH')).toBeInTheDocument()
  })
})

