'use client';

import { RetroGrid } from '@/components/magicui/retro-grid';
import { ShineBorder } from '@/components/magicui/shine-border';
import { ModeToggle } from '@/components/mode-toggle';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { cn } from '@/lib/utils';
import React from 'react';

export default function Login() {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted');
    };

    const handleLoginClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (form) {
            const formEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(formEvent);
        }
    };
    return (
        <div className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-6 lg:px-8">
            <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
                <ModeToggle />
            </div>
            <div className="pointer-events-auto relative z-[20] mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-input sm:max-w-md sm:rounded-xl sm:p-8 md:rounded-2xl dark:bg-black">
                <ShineBorder shineColor={['#DC143C', '#DAA520', '#8B4513']} />
                <div className="mb-4 flex justify-center sm:mb-6">
                    <img 
                        src="/logo-kukang.png" 
                        alt="Kukang EV Logo" 
                        className="h-12 w-auto sm:h-16 md:h-20" 
                    />
                </div>
                <h2 className="text-center text-base font-bold text-neutral-800 sm:text-lg md:text-xl dark:text-neutral-200">
                    <TextShimmer duration={4} spread={3}>
                        KUKANG EV ITERA
                    </TextShimmer>
                </h2>
                <p className="mt-3 max-w-sm text-center text-xs leading-relaxed text-neutral-600 sm:mt-4 sm:text-sm md:mt-6 dark:text-neutral-300">
                    Enter your email and password to get access to the telemetry dashboard
                </p>
                <form className="my-8" onSubmit={handleSubmit}>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" placeholder="ikuproto@kukangev.com" type="email" autoComplete="email" />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-8">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" placeholder="••••••••" type="password" autoComplete="current-password" />
                    </LabelInputContainer>
                    <div className="flex justify-center">
                        <HoverBorderGradient
                            containerClassName="w-full"
                            className="w-full bg-gradient-to-br from-black to-neutral-600 font-medium text-white dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900"
                            onClick={handleLoginClick}
                        >
                            Login &rarr;
                        </HoverBorderGradient>
                    </div>
                </form>
            </div>
            <RetroGrid className="opacity-90 sm:opacity-60 md:opacity-60" darkLineColor="#DC143C" />
        </div>
    );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
};
