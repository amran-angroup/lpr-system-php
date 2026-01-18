import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Form, Head, Link } from '@inertiajs/react';
import { EyeIcon, EyeOffIcon, StarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LoginProps {
    status?: string;
}

export default function Login({
    status,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Log in - License Plate Recognition System" />

            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
                {/* Left Section - Login Form */}
                <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Welcome back
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Login to your account
                            </p>
                        </div>

                        <Form
                            action="/login"
                            method="post"
                            resetOnSuccess={['password']}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Username
                                            </Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                name="username"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="username"
                                                placeholder="m@example.com"
                                                className="h-11 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
                                            />
                                            <InputError message={errors.username} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Password
                                                </Label>
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Forgot your password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Password"
                                                    className="h-11 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                                                >
                                                    {showPassword ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                                                </Button>
                                                <InputError message={errors.password} />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-6 h-11 w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Login
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        {status && (
                            <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        {/* Or continue with separator */}
                        <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />





                        {/* Legal Text */}
                        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
                            By clicking login, you agree to our{' '}
                            <Link
                                href="/terms"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link
                                href="/privacy"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Section - Placeholder Graphic */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100 dark:bg-gray-900 bg-[url('/Image/gate.jpeg')] bg-cover bg-center">

                    <div className="p-2 relative">
                        <Card className='max-w-xl border-none'>
                            <CardContent>
                                <p>
                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
                                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi 
                                    ut aliquip ex ea commodo consequat."
                                </p>
                            </CardContent>
                            <CardFooter className='justify-between gap-3 max-sm:flex-col max-sm:items-stretch'>
                                <div className='flex items-center gap-3'>
                                    <Avatar className='ring-ring ring-2'>
                                        <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png' alt='Hallie Richards' />
                                        <AvatarFallback className='text-xs'>SG</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col gap-0.5'>
                                        <CardTitle className='flex items-center gap-1 text-sm'>John Doe</CardTitle>
                                    </div>
                                </div>

                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
