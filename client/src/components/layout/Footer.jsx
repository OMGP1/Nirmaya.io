/**
 * Footer Component
 * 
 * Site-wide footer with links and copyright.
 */
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Doctors', href: '/doctors' },
        ],
        company: [
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Careers', href: '/careers' },
        ],
        legal: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
        ],
    };

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container-app py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏥</span>
                            <span className="text-xl font-bold text-white">Niramaya</span>
                        </Link>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Modern healthcare appointment scheduling made simple.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                    © {currentYear} Niramaya. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
