import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarMenu>
            {items.map((item) => {
                const isActive = page.url.startsWith(resolveUrl(item.href));
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            className={cn(
                                "w-full justify-start gap-3 rounded-lg px-3 py-2.5",
                                isActive 
                                    ? "text-white" 
                                    : "text-gray-700 dark:text-gray-300"
                            )}
                            style={isActive ? { backgroundColor: '#05aa9b' } : {}}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(5, 170, 155, 0.1)';
                                    e.currentTarget.style.color = '#05aa9b';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = '';
                                    e.currentTarget.style.color = '';
                                }
                            }}
                        >
                            <Link href={item.href} prefetch className="flex items-center gap-3">
                                {item.icon && <item.icon className="h-5 w-5" />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
