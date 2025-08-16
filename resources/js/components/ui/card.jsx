import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
    return <div className={cn('rounded-lg border bg-white text-gray-950 shadow-sm', className)} {...props} />;
}
