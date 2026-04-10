/**
 * Modal Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
    beforeEach(() => {
        // Create a portal root for modals
        const portalRoot = document.createElement('div');
        portalRoot.setAttribute('id', 'portal-root');
        document.body.appendChild(portalRoot);
    });

    afterEach(() => {
        // Cleanup portal root
        const portalRoot = document.getElementById('portal-root');
        if (portalRoot) {
            document.body.removeChild(portalRoot);
        }
        document.body.style.overflow = '';
    });

    it('renders null when not open', () => {
        render(<Modal isOpen={false} onClose={() => { }}>Content</Modal>);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal when open', () => {
        render(<Modal isOpen={true} onClose={() => { }}>Modal Content</Modal>);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders with title', () => {
        render(
            <Modal isOpen={true} onClose={() => { }} title="Test Title">
                Content
            </Modal>
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} showClose={true} title="Test">
                Content
            </Modal>
        );

        const closeButtons = document.querySelectorAll('button');
        fireEvent.click(closeButtons[0]);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay clicked (closeOnOverlay=true)', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} closeOnOverlay={true}>
                Content
            </Modal>
        );

        // Click the overlay (has bg-black/50 class)
        const overlay = document.querySelector('.bg-black\\/50');
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when overlay clicked (closeOnOverlay=false)', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} closeOnOverlay={false}>
                Content
            </Modal>
        );

        const overlay = document.querySelector('.bg-black\\/50');
        fireEvent.click(overlay);
        expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose on Escape key press', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose}>
                Content
            </Modal>
        );

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('hides close button when showClose=false', () => {
        render(
            <Modal isOpen={true} onClose={() => { }} showClose={false}>
                Content
            </Modal>
        );

        expect(document.querySelectorAll('button')).toHaveLength(0);
    });

    it('applies size class correctly', () => {
        const { rerender } = render(
            <Modal isOpen={true} onClose={() => { }} size="sm">
                Content
            </Modal>
        );
        expect(screen.getByRole('dialog')).toHaveClass('max-w-md');

        rerender(
            <Modal isOpen={true} onClose={() => { }} size="lg">
                Content
            </Modal>
        );
        expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl');
    });

    it('renders Modal.Footer correctly', () => {
        render(
            <Modal isOpen={true} onClose={() => { }}>
                <p>Content</p>
                <Modal.Footer>Footer Content</Modal.Footer>
            </Modal>
        );
        expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });
});
