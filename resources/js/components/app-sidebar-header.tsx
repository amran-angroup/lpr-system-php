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
            </div>
            {/* Right side - Icons and User */}
            <div className="flex items-center gap-3 justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                    <Mail className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                    <Bell className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback className="text-white" style={{ backgroundColor: '#05aa9b' }}>
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden flex-col text-left sm:flex">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {auth.user.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {auth.user.email}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
