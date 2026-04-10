/**
 * Button Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders primary variant by default', () => {
        render(<Button>Primary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
    });

    it('renders secondary variant', () => {
        render(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-secondary-500');
    });

    it('renders outline variant', () => {
        render(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button')).toHaveClass('border-primary-600');
    });

    it('renders ghost variant', () => {
        render(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button')).toHaveClass('text-gray-700');
    });

    it('renders small size', () => {
        render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('text-sm');
    });

    it('renders large size', () => {
        render(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('text-lg');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state and disables button', () => {
        render(<Button isLoading>Loading</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders with left icon', () => {
        const Icon = () => <span data-testid="icon">★</span>;
        render(<Button leftIcon={<Icon />}>With Icon</Button>);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
        const Icon = () => <span data-testid="icon">→</span>;
        render(<Button rightIcon={<Icon />}>With Icon</Button>);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('respects disabled state', () => {
        const handleClick = vi.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies custom className', () => {
        render(<Button className="my-custom-class">Custom</Button>);
        expect(screen.getByRole('button')).toHaveClass('my-custom-class');
    });
});
