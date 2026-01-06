'use client';

import { GlobalStats } from '@/components/GlobalStats';
import { L2Table } from '@/components/L2Table';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tokamak Staking V3
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Performance-based staking dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://tokamak.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Tokamak Network
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Stats Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ecosystem Overview
          </h2>
          <GlobalStats />
        </section>

        {/* L2 Networks Table */}
        <section>
          <L2Table />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Tokamak Network Staking V3 - Community Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}
