import ReputationScore from '@/components/dashboard/ReputationScore'
import { render, screen } from '@testing-library/react'

describe('ReputationScore', () => {
  it('renders the reputation score correctly', () => {
    render(<ReputationScore score={100} />)
    expect(screen.getByText('Reputation Score')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})

