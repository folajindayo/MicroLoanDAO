'use client';

import React, { useState, createContext, useContext } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children?: React.ReactNode;
  className?: string;
  variant?: 'underline' | 'pills' | 'enclosed';
}

interface TabContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabContext = createContext<TabContextType | null>(null);

const variantStyles = {
  underline: {
    container: 'border-b border-gray-200 dark:border-gray-700',
    tab: (active: boolean) => `px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors ${active ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'}`,
  },
  pills: {
    container: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
    tab: (active: boolean) => `px-4 py-2 rounded-md font-medium text-sm transition-colors ${active ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`,
  },
  enclosed: {
    container: 'border-b border-gray-200 dark:border-gray-700',
    tab: (active: boolean) => `px-4 py-2 border border-transparent font-medium text-sm rounded-t-lg -mb-px ${active ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-900 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`,
  },
};

/**
 * Tabs component
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className = '',
  variant = 'underline',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const styles = variantStyles[variant];

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: setInternalActiveTab }}>
      <div className={className}>
        <div className={`flex ${styles.container}`} role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
              className={`${styles.tab(activeTab === tab.id)} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center gap-2`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </TabContext.Provider>
  );
};

/**
 * Tab panel component
 */
export const TabPanel: React.FC<{
  tabId: string;
  children: React.ReactNode;
  className?: string;
}> = ({ tabId, children, className = '' }) => {
  const context = useContext(TabContext);
  if (!context || context.activeTab !== tabId) return null;
  return <div role="tabpanel" className={className}>{children}</div>;
};

/**
 * Simple tabs with content
 */
export const SimpleTabs: React.FC<{
  items: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
  variant?: 'underline' | 'pills' | 'enclosed';
  className?: string;
}> = ({ items, defaultTab, variant = 'underline', className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);
  const tabs = items.map(item => ({ id: item.id, label: item.label }));

  return (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant={variant} className={className}>
      {items.map(item => (
        <TabPanel key={item.id} tabId={item.id}>{item.content}</TabPanel>
      ))}
    </Tabs>
  );
};

export default Tabs;

