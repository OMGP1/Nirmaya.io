/**
 * Tooltip Component
 * 
 * Beautiful, accessible tooltips using Radix UI.
 */
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export function TooltipProvider({ children }) {
    return (
        <TooltipPrimitive.Provider delayDuration={300}>
            {children}
        </TooltipPrimitive.Provider>
    );
}

export function Tooltip({ children, content, side = 'top', align = 'center' }) {
    return (
        <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    align={align}
                    sideOffset={5}
                    className="
                        z-50 overflow-hidden rounded-lg 
                        bg-gray-900 px-3 py-2 text-sm text-white
                        shadow-lg
                        animate-in fade-in-0 zoom-in-95
                        data-[state=closed]:animate-out 
                        data-[state=closed]:fade-out-0 
                        data-[state=closed]:zoom-out-95
                        data-[side=bottom]:slide-in-from-top-2
                        data-[side=left]:slide-in-from-right-2
                        data-[side=right]:slide-in-from-left-2
                        data-[side=top]:slide-in-from-bottom-2
                    "
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-gray-900" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
}

export default Tooltip;
