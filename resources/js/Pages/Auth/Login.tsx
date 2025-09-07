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
        <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
            <div className="absolute top-4 right-4 z-20">
                <ModeToggle />
            </div>
            <div className="pointer-events-auto relative z-[20] mx-4 w-full max-w-md rounded-xl bg-white p-4 shadow-input md:mx-auto md:rounded-2xl md:p-8 dark:bg-black">
                <ShineBorder shineColor={['#DC143C', '#DAA520', '#8B4513']} />
                <div className="mb-2 flex justify-center">
                    <img src="/logo-kukang.png" alt="Kukang EV Logo" className="h-16 w-auto sm:h-20" />
                </div>
                <h2 className="text-center text-lg font-bold text-neutral-800 sm:text-xl dark:text-neutral-200">
                    <TextShimmer duration={4} spread={3}>
                        KUKANG EV ITERA
                    </TextShimmer>
                </h2>
                <p className="mt-4 max-w-sm text-center text-xs text-neutral-600 sm:mt-6 sm:text-sm dark:text-neutral-300">
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
            <RetroGrid className="opacity-40 sm:opacity-60 md:opacity-80" darkLineColor="#DC143C" />
        </div>
    );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
};
