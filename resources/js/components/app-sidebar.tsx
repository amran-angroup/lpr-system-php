import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import alarms from '@/routes/alarms';
import vehicleLogs from '@/routes/vehicle-logs';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Bell,
    Calendar,
    BarChart3,
    Users,
    Settings,
    HelpCircle,
    LogOut,
} from 'lucide-react';
import { resolveUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

const menuNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Alarms',
        href: alarms.index(),
        icon: Bell,
    },
    {
        title: 'Vehicle Logs',
        href: vehicleLogs.index(),
        icon: Calendar,
    },
];



export function AppSidebar() {
    const page = usePage();
    const handleLogout = () => {
        router.post('/logout');
    };

    const isActive = (href: string | { url: string }) => {
        const url = typeof href === 'string' ? href : href.url;
        return page.url.startsWith(resolveUrl(url));
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-gray-50 dark:bg-gray-900">
            <SidebarHeader className="border-b border-gray-200 dark:border-gray-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="bg-transparent hover:bg-transparent">
                            <Link href={dashboard()} prefetch className="flex items-center gap-2">
                                <img src="/Image/logo.png" alt="LPR System Logo" className="h-8 w-auto" />
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="mb-0.5 truncate leading-tight font-semibold text-gray-900 dark:text-white">
                                        LPR System
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="flex flex-col px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        MENU
                    </SidebarGroupLabel>


                    <SidebarMenu>
                        {menuNavItems.map((item) => {
                            const active = isActive(item.href)

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={cn(
                                            "group w-full justify-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                                            "text-gray-700 hover:bg-[rgba(5,170,155,0.1)] hover:text-[#05aa9b]",
                                            "dark:text-gray-300",
                                            "data-[active=true]:bg-[#05aa9b]",
                                            "data-[active=true]:text-white"
                                        )}
                                    >
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className="flex w-full items-center gap-3 text-inherit"
                                        >
                                            {item.icon && (
                                                <item.icon className="h-5 w-5 shrink-0 text-inherit" aria-hidden="true" />
                                            )}
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>

                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 dark:border-gray-800">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
