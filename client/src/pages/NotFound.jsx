/**
 * 404 Not Found Page
 */
import { Link } from 'react-router-dom';
import { LandingLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <LandingLayout>
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md">
                        Sorry, we couldn't find the page you're looking for.
                        It might have been moved or deleted.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                            Go Back
                        </Button>
                        <Link to="/">
                            <Button leftIcon={<Home className="w-4 h-4" />}>
                                Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default NotFound;
