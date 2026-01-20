import { Head } from '@inertiajs/react';

export default function Welcome() {
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

                <h1>
                    Welcome to the License Plate Recognition System at Bukit Kayu Hitam, Johor <br />
                </h1>
            </div>
        </>
    );
}
