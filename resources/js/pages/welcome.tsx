import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome - License Plate Recognition System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#FDFDFC] via-[#FAFAF9] to-[#F5F5F4] p-6 text-[#1b1b18] lg:p-8 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#141414]">
                <header className="mb-8 w-full max-w-7xl mx-auto">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/Image/logo.png"
                                alt="LPR System Logo"
                                className="h-10 w-auto"
                            />
                            <span className="text-lg font-semibold">LPR System</span>
                        </div>
                        <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#19140035] bg-white px-5 py-2.5 text-sm font-medium text-[#1b1b18] transition-all hover:border-[#1915014a] hover:bg-[#FAFAF9] hover:shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:hover:border-[#62605b] dark:hover:bg-[#1f1f1e]"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#05aa9b] bg-[#05aa9b] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#048a7d] hover:border-[#048a7d] hover:shadow-lg dark:border-[#05aa9b] dark:bg-[#05aa9b] dark:hover:bg-[#048a7d]"
                            >
                                Log in
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </Link>
                        )}
                        </div>
                    </nav>
                </header>
                <div className="flex w-full flex-1 items-center justify-center">
                    <main className="w-full max-w-7xl mx-auto">
                        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                            <div className="flex flex-col justify-center space-y-8">
                                <div className="space-y-4">
                                    <h1 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl xl:text-6xl">
                                        Advanced License Plate
                                        <span className="block bg-gradient-to-r from-[#05aa9b] to-[#07c4b2] bg-clip-text text-transparent dark:from-[#05aa9b] dark:to-[#07c4b2]">
                                            Recognition System
                                        </span>
                            </h1>
                                    <p className="text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A] lg:text-xl">
                                        Intelligent vehicle tracking and monitoring solution with real-time
                                        license plate recognition, automated logging, and comprehensive
                                        alarm management.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#1b1b18] bg-white px-6 py-3 text-base font-semibold text-[#1b1b18] transition-all hover:bg-[#FAFAF9] hover:shadow-md dark:border-[#EDEDEC] dark:bg-[#161615] dark:text-[#EDEDEC] dark:hover:bg-[#1f1f1e]"
                                        >
                                            Go to Dashboard
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#1b1b18] bg-white px-6 py-3 text-base font-semibold text-[#1b1b18] transition-all hover:bg-[#FAFAF9] hover:shadow-md dark:border-[#EDEDEC] dark:bg-[#161615] dark:text-[#EDEDEC] dark:hover:bg-[#1f1f1e]"
                                        >
                                            Sign In
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </Link>
                                    )}
                                </div>

                                <div className="grid gap-6 pt-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#05aa9b]/10 to-[#07c4b2]/10 dark:from-[#05aa9b]/20 dark:to-[#07c4b2]/20">
                                            <svg
                                                className="h-6 w-6 text-[#05aa9b] dark:text-[#05aa9b]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Real-time Recognition
                                            </h3>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                Instant license plate detection and OCR processing
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#05aa9b]/10 to-[#07c4b2]/10 dark:from-[#05aa9b]/20 dark:to-[#07c4b2]/20">
                                            <svg
                                                className="h-6 w-6 text-[#05aa9b] dark:text-[#05aa9b]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Vehicle Logging
                                            </h3>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                Comprehensive tracking with vehicle details and timestamps
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#05aa9b]/10 to-[#07c4b2]/10 dark:from-[#05aa9b]/20 dark:to-[#07c4b2]/20">
                                            <svg
                                                className="h-6 w-6 text-[#05aa9b] dark:text-[#05aa9b]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Alarm Management
                                            </h3>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                Automated alarm synchronization and monitoring
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#05aa9b]/10 to-[#07c4b2]/10 dark:from-[#05aa9b]/20 dark:to-[#07c4b2]/20">
                                            <svg
                                                className="h-6 w-6 text-[#05aa9b] dark:text-[#05aa9b]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Advanced Search
                                            </h3>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                Quick search by plate, vehicle type, color, and date
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative hidden lg:block">
                                <div className="relative rounded-2xl bg-gradient-to-br from-[#e6f7f5] to-[#d0f0ed] p-12 shadow-2xl dark:from-[#001a18] dark:to-[#002d2a]">
                                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(5,170,155,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(5,170,155,0.15),transparent_70%)]" />
                                    <div className="relative space-y-8">
                                        <div className="flex items-center justify-center">
                                            <div className="relative">
                                                <div className="absolute inset-0 animate-pulse rounded-full bg-[#05aa9b]/20 blur-xl dark:bg-[#05aa9b]/20" />
                                                <div className="relative flex h-32 w-32 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-[#161615]">
                                                    <svg
                                                        className="h-16 w-16 text-[#05aa9b] dark:text-[#05aa9b]"
                                fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 text-center">
                                            <h3 className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Smart Vehicle Tracking
                                            </h3>
                                            <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                                Monitor vehicle movements with precision and accuracy
                                            </p>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 backdrop-blur-sm dark:bg-[#161615]/80">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#05aa9b]/10 dark:bg-[#05aa9b]/20">
                                                    <svg
                                                        className="h-5 w-5 text-[#05aa9b] dark:text-[#05aa9b]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        License Plate Detection
                                                    </div>
                                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                        High accuracy OCR processing
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 backdrop-blur-sm dark:bg-[#161615]/80">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#05aa9b]/10 dark:bg-[#05aa9b]/20">
                                                    <svg
                                                        className="h-5 w-5 text-[#05aa9b] dark:text-[#05aa9b]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        Real-time Monitoring
                                                    </div>
                                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                        Live updates and notifications
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
