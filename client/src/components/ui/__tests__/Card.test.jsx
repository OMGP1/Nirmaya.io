/**
 * Card Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
    it('renders children correctly', () => {
        render(<Card>Card Content</Card>);
        expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies base classes', () => {
        render(<Card data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('bg-white', 'rounded-xl');
    });

    it('applies hoverable class when hoverable=true', () => {
        render(<Card data-testid="card" hoverable>Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('hover:shadow-soft');
    });

    it('applies cursor-pointer when onClick provided', () => {
        render(<Card data-testid="card" onClick={() => { }}>Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('cursor-pointer');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Card data-testid="card" onClick={handleClick}>Content</Card>);

        fireEvent.click(screen.getByTestId('card'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
        render(<Card data-testid="card" className="custom-class">Content</Card>);
        expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });
});

describe('Card.Header', () => {
    it('renders with correct classes', () => {
        render(
            <Card>
                <Card.Header data-testid="header">Header</Card.Header>
            </Card>
        );
        const header = screen.getByTestId('header');
        expect(header).toHaveClass('px-6', 'py-4', 'border-b');
    });
});

describe('Card.Title', () => {
    it('renders as h3 with correct classes', () => {
        render(
            <Card>
                <Card.Title>Title Text</Card.Title>
            </Card>
        );
        const title = screen.getByRole('heading', { level: 3 });
        expect(title).toHaveTextContent('Title Text');
        expect(title).toHaveClass('text-lg', 'font-semibold');
    });
});

describe('Card.Description', () => {
    it('renders with correct classes', () => {
        render(
            <Card>
                <Card.Description data-testid="desc">Description</Card.Description>
            </Card>
        );
        expect(screen.getByTestId('desc')).toHaveClass('text-sm', 'text-gray-500');
    });
});

describe('Card.Content', () => {
    it('renders with padding', () => {
        render(
            <Card>
                <Card.Content data-testid="content">Content</Card.Content>
            </Card>
        );
        expect(screen.getByTestId('content')).toHaveClass('p-6');
    });
});

describe('Card.Footer', () => {
    it('renders with border and background', () => {
        render(
            <Card>
                <Card.Footer data-testid="footer">Footer</Card.Footer>
            </Card>
        );
        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('border-t', 'bg-gray-50');
    });
});
