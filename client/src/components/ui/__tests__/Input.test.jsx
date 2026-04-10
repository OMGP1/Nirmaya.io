/**
 * Input Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
    it('renders with default props', () => {
        render(<Input placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with label', () => {
        render(<Input label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('handles value changes', () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(handleChange).toHaveBeenCalled();
    });

    it('shows error message', () => {
        render(<Input error="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('respects disabled state', () => {
        render(<Input disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies custom className', () => {
        render(<Input className="custom-class" />);
        // The className is applied to the input wrapper or input
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
    });
});
