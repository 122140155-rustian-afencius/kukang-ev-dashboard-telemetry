import { cn } from '../../lib/utils';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('rounded-lg border bg-white text-gray-950 shadow-sm', className)} {...props} />;
}
