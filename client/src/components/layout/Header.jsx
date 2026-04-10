/**
 * Header Component - Shadcn Style
 * 
 * Clean, minimal navigation header with user menu.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Button, Separator } from '@/components/ui';
import {
    Menu,
    X,
    Calendar,
    User,
    LogOut,
    Settings,
    ChevronDown,
} from 'lucide-react';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, profile, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();

    const navLinks = [
        { href: '/doctors', label: 'Find Specialists' },
        { href: '/departments', label: 'Departments' },
        { href: '/about', label: 'About' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container-app">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">HealthBook</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {isAuthenticated && (
                            <Link
                                to="/dashboard"
                                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                Dashboard
                            </Link>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
                                >
                                    <Avatar
                                        name={profile?.full_name || user?.email}
                                        size="sm"
                                    />
                                    <span className="text-sm font-medium">
                                        {profile?.full_name?.split(' ')[0] || 'User'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </button>

                                {/* User Dropdown */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md animate-fade-in">
                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Link>
                                        <Separator className="my-1" />
                                        <button
                                            onClick={handleSignOut}
                                            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-accent"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Sign In</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md hover:bg-muted"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t animate-fade-in">
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Separator className="my-2" />
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="px-3 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-md text-left"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 px-3 pt-2">
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
