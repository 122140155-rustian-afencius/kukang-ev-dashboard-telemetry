'use client';

import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { ShineBorder } from '@/components/magicui/shine-border';
import { ModeToggle } from '@/components/mode-toggle';
import { RetroGrid } from '@/components/magicui/retro-grid';
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
                <p className="mt-4 max-w-sm text-center text-xs sm:mt-6 sm:text-sm text-neutral-600 dark:text-neutral-300">
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
                    <ShimmerButton className="w-full font-medium" type="submit" shimmerColor="#DC143C" borderRadius="15px">
                        Login
                    </ShimmerButton>
                </form>
            </div>
            <RetroGrid className="opacity-40 sm:opacity-60 md:opacity-80" darkLineColor="#DC143C" />
        </div>
    );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
};
