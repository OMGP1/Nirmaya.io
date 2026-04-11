/**
 * Enhanced ChatWindow Component
 * 
 * Premium UI that matches the main app design
 * Features:
 * - Session reset per user/login
 * - Doctor recommendations
 * - Available time slots
 * - Beautiful gradient styling
 */
import { useState, useEffect, useRef } from 'react';
import { X, Send, Calendar, User, Clock, ArrowRight, MessageCircle, Sparkles, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import Message, { TypingIndicator } from './Message';
import { sendMessage, bookAppointment } from '@/services/chatbot';
import { useAuth } from '@/hooks/useAuth';
import SOSModal from '@/components/emergency/SOSModal';

const QuickReply = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-niramaya-teal-accent hover:bg-niramaya-teal/10 hover:border-niramaya-teal/30 hover:shadow-md transition-all duration-200 whitespace-nowrap"
    >
        {text}
    </button>
);

const DoctorCard = ({ doctor, onSelect }) => (
    <div
        onClick={() => onSelect(doctor)}
        className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-niramaya-teal/5 transition-all duration-300 border border-slate-200 hover:border-niramaya-teal hover:shadow-teal-glow group"
    >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-niramaya-teal to-niramaya-teal-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
            <p className="font-semibold text-gray-900">Dr. {doctor.name}</p>
            <p className="text-sm text-niramaya-teal-accent">{doctor.specialization || doctor.departmentName}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-niramaya-teal/10 flex items-center justify-center group-hover:bg-niramaya-teal/20 transition-colors">
            <ArrowRight className="w-4 h-4 text-niramaya-teal-accent" />
        </div>
    </div>
);

const TimeSlotButton = ({ slot, onSelect }) => (
    <button
        onClick={() => onSelect(slot)}
        className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-niramaya-teal hover:text-white hover:border-transparent transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-lg"
    >
        <Clock className="w-4 h-4" />
        {slot.display}
    </button>
);

// Get initial welcome message
const getWelcomeMessage = (userName) => ({
    id: 1,
    text: `Hi${userName ? ` ${userName}` : ''}! 👋 I'm your Niramaya AI assistant. I can help you book appointments based on your symptoms. Just describe how you're feeling, and I'll suggest the right department and doctor for you!`,
    isBot: true,
    timestamp: new Date().toISOString()
});

const ChatWindow = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Session key for this user
    const sessionKey = user?.id || 'anonymous';

    const [messages, setMessages] = useState([getWelcomeMessage(user?.user_metadata?.full_name?.split(' ')[0])]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [quickReplies, setQuickReplies] = useState([
        'Book appointment',
        'View my appointments',
        'I have a headache',
    ]);
    const [currentDoctors, setCurrentDoctors] = useState([]);
    const [currentSlots, setCurrentSlots] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [lastUserId, setLastUserId] = useState(sessionKey);
    const [isRecording, setIsRecording] = useState(false);
    const [showSOS, setShowSOS] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Reset chat when user changes (login/logout)
    useEffect(() => {
        if (sessionKey !== lastUserId) {
            // User changed - reset the chat
            setMessages([getWelcomeMessage(user?.user_metadata?.full_name?.split(' ')[0])]);
            setCurrentDoctors([]);
            setCurrentSlots([]);
            setSelectedDoctor(null);
            setPendingBooking(null);
            setQuickReplies(['Book appointment', 'View my appointments', 'I have a headache']);
            setLastUserId(sessionKey);
        }
    }, [sessionKey, lastUserId, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, currentDoctors, currentSlots]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || !user) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            isBot: false,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setCurrentDoctors([]);
        setCurrentSlots([]);

        try {
            const response = await sendMessage(inputValue, user.id);

            const botMessage = {
                id: Date.now() + 1,
                text: response.message,
                isBot: true,
                timestamp: new Date().toISOString(),
                intent: response.intent,
                departmentInfo: response.departmentInfo,
                riskScore: response.riskScore,
                riskStatus: response.riskStatus
            };

            setMessages(prev => [...prev, botMessage]);

            // Handle navigation
            if (response.navigation) {
                setPendingBooking({
                    navigation: response.navigation,
                    department: response.departmentInfo?.name,
                    doctors: response.doctors
                });
            }

            // Show doctors if available
            if (response.doctors?.length > 0) {
                setCurrentDoctors(response.doctors);
                // Also generate time slots when doctors are available
                setCurrentSlots(response.slots || []);
            }

            // Update quick replies based on context
            if (response.departmentInfo) {
                setQuickReplies([
                    `Book ${response.departmentInfo.name} appointment`,
                    'View my appointments',
                    'Show more options'
                ]);
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm sorry, I'm having trouble processing that. Please try again.",
                isBot: true,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const processVoiceTriage = async (transcript) => {
        setIsTyping(true);
        const userMessage = { id: Date.now(), text: transcript, isBot: false, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        
        try {
            // Re-route voice transcript natively through chatbot service
            const response = await sendMessage(transcript, sessionKey);
            
            const botMessage = {
                id: Date.now() + 1,
                text: response.message,
                isBot: true,
                timestamp: new Date().toISOString(),
                intent: response.intent,
                departmentInfo: response.departmentInfo,
                riskScore: response.riskScore,
                riskStatus: response.riskStatus
            };

            setMessages(prev => [...prev, botMessage]);

            if (response.navigation) {
                setPendingBooking({
                    navigation: response.navigation,
                    department: response.departmentInfo?.name,
                    doctors: response.doctors
                });
            }

            if (response.doctors?.length > 0) {
                setCurrentDoctors(response.doctors);
                setCurrentSlots(response.slots || []);
            }

            if (response.departmentInfo) {
                setQuickReplies([
                    `Book ${response.departmentInfo.name} appointment`,
                    'View my appointments',
                    'Show more options'
                ]);
            }
        } catch(err) {
            console.error('Failed to process voice transcript:', err);
            setMessages(prev => [...prev, { id: Date.now()+1, text: "I'm sorry, I'm having trouble processing that. Please try again.", isBot: true, timestamp: new Date().toISOString() }]);
        }
        setIsTyping(false);
    };

    const handleVoiceRecord = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Voice Recognition.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        let finalSegment = '';
        
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => {
            finalSegment = event.results[event.results.length - 1][0].transcript;
            setInputValue(finalSegment);
        };
        recognition.onend = async () => {
            setIsRecording(false);
            if (finalSegment.trim()) {
                setInputValue('');
                await processVoiceTriage(finalSegment);
            }
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.start();
    };


    const handleDoctorSelect = (doctor) => {
        setSelectedDoctor(doctor);
        const botMessage = {
            id: Date.now(),
            text: `Excellent choice! 🎉 Dr. ${doctor.name} from ${doctor.departmentName || 'our team'} is ready to help you. Please select a convenient time slot below:`,
            isBot: true,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentDoctors([]);
    };

    const handleSlotSelect = async (slot) => {
        if (!user || !selectedDoctor) {
            // If no doctor selected, navigate to booking page
            if (pendingBooking?.navigation) {
                navigate(pendingBooking.navigation.page, {
                    state: pendingBooking.navigation.params
                });
                onClose();
            }
            return;
        }

        setIsTyping(true);
        setCurrentSlots([]);

        try {
            const response = await bookAppointment({
                userId: user.id,
                doctorId: selectedDoctor.id,
                datetime: slot.datetime,
                department: selectedDoctor.departmentName,
                reason: pendingBooking?.department ? `${pendingBooking.department} consultation` : 'Consultation'
            });

            const successMessage = {
                id: Date.now(),
                text: `🎉 ${response.message || 'Appointment booked successfully!'}\n\nYou'll receive a confirmation email shortly.`,
                isBot: true,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, successMessage]);

            // Add navigation prompt
            setQuickReplies(['View my appointments', 'Book another appointment']);

            // Reset state
            setSelectedDoctor(null);
            setPendingBooking(null);

        } catch (error) {
            console.error('Booking failed:', error);
            const errorMessage = {
                id: Date.now(),
                text: "Sorry, I couldn't complete the booking. Please try again or use the booking page.",
                isBot: true,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickReply = async (text) => {
        if (text === 'View my appointments') {
            navigate('/appointments');
            onClose();
            return;
        }
        if (text === 'Book another appointment') {
            navigate('/book');
            onClose();
            return;
        }
        setInputValue(text);
        inputRef.current?.focus();
    };

    const handleNavigate = () => {
        if (pendingBooking?.navigation) {
            navigate(pendingBooking.navigation.page, {
                state: pendingBooking.navigation.params
            });
            onClose();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Reset chat function
    const handleResetChat = () => {
        setMessages([getWelcomeMessage(user?.user_metadata?.full_name?.split(' ')[0])]);
        setCurrentDoctors([]);
        setCurrentSlots([]);
        setSelectedDoctor(null);
        setPendingBooking(null);
        setQuickReplies(['Book appointment', 'View my appointments', 'I have a headache']);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-start p-4 sm:p-6 md:pl-[280px] md:pb-8">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm md:bg-black/20"
                onClick={onClose}
            />

            <div className="relative w-full h-[650px] md:w-[420px] md:h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col animate-slide-up overflow-hidden border border-slate-200">
                {/* Header - Premium Gradient */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-niramaya-navy to-niramaya-navy-sidebar text-white">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10">
                                <Sparkles className="w-6 h-6 text-niramaya-teal-light" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-clinical-stable rounded-full border-2 border-niramaya-navy"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Niramaya AI</h3>
                            <p className="text-sm text-slate-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-clinical-stable rounded-full animate-pulse-teal"></span>
                                Clinical triage
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleResetChat}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sm"
                            title="New conversation"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col gap-2">
                            <Message
                                message={msg.text}
                                isBot={msg.isBot}
                                timestamp={msg.timestamp}
                            />
                            {/* Productivity Feature: Dynamic SOS Trigger */}
                            {msg.riskScore && msg.riskScore > 75 && msg.isBot && (
                                <button
                                    onClick={() => setShowSOS(true)}
                                    className="ml-10 self-start px-4 py-2 mt-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center gap-2 animate-pulse"
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                    </span>
                                    <span>Critical Risk ({msg.riskScore}%) — Trigger SOS</span>
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Doctor Cards */}
                    {currentDoctors.length > 0 && (
                        <div className="space-y-3 animate-fade-in">
                            <p className="text-sm font-semibold text-niramaya-teal flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Available Doctors
                            </p>
                            {currentDoctors.slice(0, 3).map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onSelect={handleDoctorSelect}
                                />
                            ))}
                        </div>
                    )}

                    {/* Time Slots */}
                    {currentSlots.length > 0 && selectedDoctor && (
                        <div className="space-y-3 animate-fade-in">
                            <p className="text-sm font-semibold text-niramaya-teal flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Available Time Slots
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {currentSlots.slice(0, 6).map((slot, i) => (
                                    <TimeSlotButton
                                        key={i}
                                        slot={slot}
                                        onSelect={handleSlotSelect}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigate to Booking Button */}
                    {pendingBooking && !selectedDoctor && currentDoctors.length === 0 && !pendingBooking.isVoiceAutoBook && (
                        <div className="animate-fade-in">
                            <Button
                                onClick={handleNavigate}
                                className="w-full bg-niramaya-teal hover:bg-niramaya-teal-accent text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                                Go to Booking Page <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {quickReplies.length > 0 && !isTyping && (
                    <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white border-t border-slate-100">
                        {quickReplies.map((reply, index) => (
                            <QuickReply
                                key={index}
                                text={reply}
                                onClick={handleQuickReply}
                            />
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your symptoms..."
                            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-niramaya-teal/50 focus:border-niramaya-teal/50 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                            disabled={isTyping || isRecording}
                        />
                        <Button
                            onClick={handleVoiceRecord}
                            disabled={isTyping}
                            className={`px-4 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-2xl shadow transition-all`}
                            title="Voice Input"
                        >
                            <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : ''}`} />
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="px-5 bg-niramaya-teal hover:bg-niramaya-teal-accent text-white rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Emergency SOS Modal */}
            <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} />
        </div>
    );
};

export default ChatWindow;
