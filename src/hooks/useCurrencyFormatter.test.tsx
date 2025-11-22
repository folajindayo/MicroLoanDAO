import { render, screen } from '@testing-library/react'
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter'

const TestComponent = ({ value }: { value: string }) => {
  const { formatETH } = useCurrencyFormatter()
  return <div>{formatETH(value)}</div>
}

describe('useCurrencyFormatter', () => {
  it('formats wei to ETH correctly', () => {
    render(<TestComponent value="1000000000000000000" />)
    expect(screen.getByText('1 ETH')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(<TestComponent value="0" />)
    expect(screen.getByText('0 ETH')).toBeInTheDocument()
  })
})

