/**
 * Tabs Component
 * 
 * Horizontal tabs for content switching.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';

const Tabs = ({ tabs, defaultTab, onChange, className }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);

    const handleTabChange = (value) => {
        setActiveTab(value);
        onChange?.(value);
    };

    const activeContent = tabs.find((tab) => tab.value === activeTab)?.content;

    return (
        <div className={className}>
            {/* Tab List */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={cn(
                            'px-4 py-3 text-sm font-medium transition-colors relative',
                            'hover:text-primary-600',
                            activeTab === tab.value
                                ? 'text-primary-600'
                                : 'text-gray-500'
                        )}
                    >
                        <span className="flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                        </span>
                        {activeTab === tab.value && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="pt-4">
                {activeContent}
            </div>
        </div>
    );
};

// Alternative: Controlled tabs
const TabList = ({ children, className }) => (
    <div className={cn('flex border-b border-gray-200', className)}>
        {children}
    </div>
);

const Tab = ({ active, onClick, children, className }) => (
    <button
        onClick={onClick}
        className={cn(
            'px-4 py-3 text-sm font-medium transition-colors relative',
            'hover:text-primary-600',
            active ? 'text-primary-600' : 'text-gray-500',
            className
        )}
    >
        {children}
        {active && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
        )}
    </button>
);

const TabPanel = ({ children, className }) => (
    <div className={cn('pt-4', className)}>
        {children}
    </div>
);

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;
