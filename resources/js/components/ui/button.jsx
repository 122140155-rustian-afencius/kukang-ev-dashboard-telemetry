import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Button = forwardRef(function Button({ className, ...props }, ref) {
    return (
        <button
            ref={ref}
            className={cn('inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50', className)}
            {...props}
        />
    );
});
