/**
 * Premium Message Component
 * 
 * Individual message bubble with enhanced styling
 */
import { format } from 'date-fns';
import { Sparkles, User } from 'lucide-react';

const Message = ({ message, isBot, timestamp }) => {
    return (
        <div className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${isBot
                    ? 'bg-gradient-to-br from-niramaya-teal to-niramaya-teal-accent'
                    : 'bg-gradient-to-br from-niramaya-navy to-niramaya-navy-sidebar'
                }`}>
                {isBot ? (
                    <Sparkles className="w-5 h-5 text-white" />
                ) : (
                    <User className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[75%] ${isBot ? '' : 'text-right'}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${isBot
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-md'
                        : 'bg-gradient-to-r from-niramaya-teal to-niramaya-teal-accent text-white rounded-tr-md'
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
                </div>
                {timestamp && (
                    <p className={`text-xs text-gray-400 mt-1.5 px-1 ${isBot ? '' : 'text-right'}`}>
                        {format(new Date(timestamp), 'h:mm a')}
                    </p>
                )}
            </div>
        </div>
    );
};

// Enhanced Typing Indicator
export const TypingIndicator = () => {
    return (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-niramaya-teal to-niramaya-teal-accent flex items-center justify-center flex-shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-niramaya-teal/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-niramaya-teal/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-niramaya-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Message;
