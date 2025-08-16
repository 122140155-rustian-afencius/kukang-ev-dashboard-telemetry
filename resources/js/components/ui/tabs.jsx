import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export function Tabs({ className, ...props }) {
    return <TabsPrimitive.Root className={cn('w-full', className)} {...props} />;
}

export const TabsList = forwardRef(function TabsList({ className, ...props }, ref) {
    return <TabsPrimitive.List ref={ref} className={cn('inline-flex border-b w-full', className)} {...props} />;
});

export const TabsTrigger = forwardRef(function TabsTrigger({ className, ...props }, ref) {
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn('px-3 py-2 text-sm data-[state=active]:border-b-2 border-blue-600', className)}
            {...props}
        />
    );
});

export const TabsContent = forwardRef(function TabsContent({ className, ...props }, ref) {
    return <TabsPrimitive.Content ref={ref} className={cn(className)} {...props} />;
});
