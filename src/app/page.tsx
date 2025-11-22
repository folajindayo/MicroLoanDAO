'use client'

import Dashboard from "@/components/Dashboard";
import LoanList from "@/components/LoanList";
import LoanRequestForm from "@/components/LoanRequestForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MicroLoan DAO
          </h1>
          <div className="rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* @ts-expect-error w3m-button is a web component */}
            <w3m-button />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Dashboard & Request */}
            <div className="lg:col-span-1 space-y-8">
              <Dashboard />
              <LoanRequestForm />
            </div>

            {/* Right Column: Loan List */}
            <div className="lg:col-span-2">
              <LoanList />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
