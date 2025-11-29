/**
 * LoanList Component
 * Enhanced loan list with pagination, filtering, and sorting
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useFundLoan } from '@/hooks/useFundLoan';
import { useLoans } from '@/hooks/useLoans';
import { usePagination } from '@/hooks/usePagination';

import LoadingSkeleton from './ui/LoadingSkeleton';
import LoanCard from './loanlist/LoanCard';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

export type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'interest-high' | 'interest-low';
export type FilterOption = 'all' | 'pending' | 'funded' | 'my-loans';

export interface LoanListProps {
  pageSize?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  title?: string;
  className?: string;
}

/**
 * Pagination component
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      
      if (currentPage > 3) result.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) result.push(i);
      
      if (currentPage < totalPages - 2) result.push('ellipsis');
      
      result.push(totalPages);
    }
    
    return result;
  }, [currentPage, totalPages]);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      <div className="flex items-center gap-1">
        {pages.map((page, index) => (
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                w-8 h-8 rounded-md text-sm font-medium transition-colors
                ${currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

/**
 * Filter bar component
 */
function FilterBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (value: FilterOption) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search by address or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex gap-2">
        <Select
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
          className="w-32"
        >
          <option value="all">All Loans</option>
          <option value="pending">Pending</option>
          <option value="funded">Funded</option>
          <option value="my-loans">My Loans</option>
        </Select>
        
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-40"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-high">Highest Amount</option>
          <option value="amount-low">Lowest Amount</option>
          <option value="interest-high">Highest Interest</option>
          <option value="interest-low">Lowest Interest</option>
        </Select>
      </div>
    </div>
  );
}

/**
 * Enhanced loan list with pagination and filtering
 */
export default function LoanList({
  pageSize = 9,
  showFilters = true,
  showPagination = true,
  title = 'Active Loan Requests',
  className = '',
}: LoanListProps) {
  const { address } = useAccount();
  const { loans, isLoading, error } = useLoans();
  const { fundLoan, isWritePending, fundingLoanId } = useFundLoan();
  
  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  // Filter and sort loans
  const filteredLoans = useMemo(() => {
    let result = [...loans];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(loan =>
        loan.id.toLowerCase().includes(search) ||
        loan.borrower?.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    switch (filterBy) {
      case 'pending':
        result = result.filter(loan => loan.status === 'PENDING');
        break;
      case 'funded':
        result = result.filter(loan => loan.status === 'FUNDED');
        break;
      case 'my-loans':
        if (address) {
          result = result.filter(loan =>
            loan.borrower?.toLowerCase() === address.toLowerCase() ||
            loan.lender?.toLowerCase() === address.toLowerCase()
          );
        }
        break;
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'amount-high':
          return Number(b.amount) - Number(a.amount);
        case 'amount-low':
          return Number(a.amount) - Number(b.amount);
        case 'interest-high':
          return Number(b.interestRate) - Number(a.interestRate);
        case 'interest-low':
          return Number(a.interestRate) - Number(b.interestRate);
        default:
          return 0;
      }
    });
    
    return result;
  }, [loans, searchTerm, sortBy, filterBy, address]);
  
  // Pagination
  const { currentPage, setCurrentPage, totalPages, startIndex, endIndex } = usePagination({
    totalItems: filteredLoans.length,
    pageSize,
  });
  
  // Paginated loans
  const paginatedLoans = useMemo(
    () => filteredLoans.slice(startIndex, endIndex),
    [filteredLoans, startIndex, endIndex]
  );
  
  // Reset page when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, [setCurrentPage]);
  
  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  }, [setCurrentPage]);
  
  const handleFilterChange = useCallback((value: FilterOption) => {
    setFilterBy(value);
    setCurrentPage(1);
  }, [setCurrentPage]);
  
  // Loading state
  if (isLoading) return <LoadingSkeleton />;
  
  // Error state
  if (error) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
        <p className="text-red-400">Error loading loans. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={`mt-8 ${className}`} role="region" aria-label={title}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-sm text-gray-500">
          {filteredLoans.length} {filteredLoans.length === 1 ? 'loan' : 'loans'}
        </span>
      </div>
      
      {/* Filters */}
      {showFilters && loans.length > 0 && (
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          filterBy={filterBy}
          onFilterChange={handleFilterChange}
        />
      )}
      
      {/* Empty state */}
      {filteredLoans.length === 0 ? (
        <EmptyState
          title={searchTerm || filterBy !== 'all' ? 'No loans match your filters' : 'No active requests'}
          description={
            searchTerm || filterBy !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Be the first to request a loan!'
          }
          action={
            (searchTerm || filterBy !== 'all') && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                }}
              >
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Loan grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedLoans.map((loan) => (
          <LoanCard 
            key={loan.id} 
            loan={loan} 
            userAddress={address} 
            onFund={fundLoan} 
            isWritePending={isWritePending}
            fundingLoanId={fundingLoanId}
          />
        ))}
      </div>
          
          {/* Pagination */}
          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
