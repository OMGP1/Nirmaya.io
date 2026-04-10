/**
 * ChatBubble Component
 * 
 * Floating chat trigger button
 */
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatBubble = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-niramaya-navy to-niramaya-teal text-white rounded-full shadow-teal-glow hover:shadow-[0_0_20px_rgba(0,128,128,0.5)] transition-all duration-300 flex items-center justify-center group hover:scale-110"
                aria-label="Open chat"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-6 h-6" />
                )}

                {/* Pulse ring animation */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-niramaya-teal opacity-0 group-hover:opacity-20 animate-ping"></span>
                )}
            </button>

            {/* Chat Window */}
            <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default ChatBubble;
