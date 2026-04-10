/**
 * Calendar Component
 * 
 * Date picker using react-day-picker wrapped in our design system.
 */
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const Calendar = ({
    selected,
    onSelect,
    disabled,
    minDate,
    maxDate,
    className,
    ...props
}) => {
    return (
        <div className={cn('p-3 bg-white rounded-xl shadow-card', className)}>
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={onSelect}
                disabled={disabled}
                fromDate={minDate}
                toDate={maxDate}
                showOutsideDays={false}
                className="!font-sans"
                classNames={{
                    months: 'flex flex-col sm:flex-row gap-4',
                    month: 'space-y-4',
                    caption: 'flex justify-center items-center relative h-10',
                    caption_label: 'text-sm font-semibold text-gray-900',
                    nav: 'flex items-center gap-1',
                    nav_button: cn(
                        'h-8 w-8 bg-transparent p-0 flex items-center justify-center',
                        'rounded-lg hover:bg-gray-100 transition-colors',
                        'text-gray-600 disabled:opacity-50'
                    ),
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse',
                    head_row: 'flex',
                    head_cell: 'text-gray-500 w-10 font-medium text-xs uppercase',
                    row: 'flex w-full mt-1',
                    cell: 'relative p-0 text-center',
                    day: cn(
                        'h-10 w-10 p-0 font-normal',
                        'rounded-lg transition-colors',
                        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
                    ),
                    day_selected: 'bg-primary-600 text-white hover:bg-primary-700',
                    day_today: 'bg-gray-100 font-semibold',
                    day_outside: 'text-gray-400 opacity-50',
                    day_disabled: 'text-gray-400 opacity-50 cursor-not-allowed hover:bg-transparent',
                }}
                components={{
                    IconLeft: () => <ChevronLeft className="w-4 h-4" />,
                    IconRight: () => <ChevronRight className="w-4 h-4" />,
                }}
                {...props}
            />
        </div>
    );
};

// Helper component for date input with calendar popup
const DatePicker = ({
    value,
    onChange,
    placeholder = 'Select a date',
    minDate,
    maxDate,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full px-4 py-3 text-left border border-gray-300 rounded-lg',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'transition-all',
                    !value && 'text-gray-400',
                    className
                )}
            >
                {value ? format(value, 'PPP') : placeholder}
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2">
                    <Calendar
                        selected={value}
                        onSelect={(date) => {
                            onChange(date);
                            setIsOpen(false);
                        }}
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                </div>
            )}
        </div>
    );
};

Calendar.Picker = DatePicker;

export default Calendar;
