import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, Bell, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useInitials } from '@/hooks/use-initials';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-6 transition-[width,height] ease-linear dark:border-gray-800 dark:bg-gray-900 md:px-4">
            <div className="flex items-center gap-3 justify-start">
                <SidebarTrigger className="-ml-1" />

                {/*breadcrumbs */}
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
