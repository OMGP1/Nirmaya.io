/**
 * PageLayout Component
 * 
 * Standard page layout with optional sidebar for dashboard views.
 * Includes MobileNav for mobile devices and Sidebar for desktop.
 */
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { cn } from '@/lib/utils';

const PageLayout = ({
    children,
    showSidebar = false,
    showFooter = true,
    className,
}) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Only show Header when NOT in sidebar/dashboard mode */}
            {!showSidebar && <Header />}

            <div className="flex-1 flex">
                {showSidebar && <Sidebar />}

                <main
                    className={cn(
                        'flex-1',
                        // Add top padding for mobile header when sidebar is shown
                        showSidebar ? 'pt-20 lg:pt-6 px-4 pb-6 md:px-6' : 'pb-20 md:pb-0',
                        className
                    )}
                >
                    {children}
                </main>
            </div>

            {showFooter && <Footer />}
        </div>
    );
};

// Dashboard layout variant (with sidebar, no footer)
export const DashboardLayout = ({ children, className }) => (
    <PageLayout showSidebar showFooter={false} className={className}>
        {children}
    </PageLayout>
);

// Landing layout variant (no sidebar, with footer)
export const LandingLayout = ({ children, className }) => (
    <PageLayout showSidebar={false} showFooter className={className}>
        {children}
    </PageLayout>
);

export default PageLayout;
