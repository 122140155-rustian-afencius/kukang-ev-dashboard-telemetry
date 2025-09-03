'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import React from 'react';

export default function Login() {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted');
    };
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="absolute top-4 right-4 z-20">
                <ModeToggle />
            </div>
            <div className="pointer-events-auto relative z-[20] mx-auto w-full max-w-md rounded-none bg-white p-4 shadow-input md:rounded-2xl md:p-8 dark:bg-black">
                <div className="mb-2 flex justify-center">
                    <img src="/logo-kukang.png" alt="Kukang EV Logo" className="h-20 w-auto" />
                </div>
                <h2 className="text-center text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    Kukang EV ITERA
                    <br />
                    Dashboard Telemetry
                </h2>
                <p className="mt-2 max-w-sm text-center text-sm text-neutral-600 dark:text-neutral-300">
                    Enter your email and password to get access to the telemetry dashboard
                </p>
                <form className="my-8" onSubmit={handleSubmit}>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" placeholder="ikuproto@kukangev.com" type="email" />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" placeholder="••••••••" type="password" />
                    </LabelInputContainer>
                    <button
                        className="group/btn relative block h-10 w-full cursor-pointer rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                        type="submit"
                    >
                        Login &rarr;
                        <BottomGradient />
                    </button>
                </form>
            </div>
            <BackgroundBeams />
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
};
