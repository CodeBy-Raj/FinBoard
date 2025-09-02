'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CandlestickChart,
  Wallet,
  Settings,
  Users,
  Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/watchlist', icon: CandlestickChart, label: 'Watchlist' },
  { href: '/news', icon: Newspaper, label: 'News' },
  { href: '/portfolio', icon: Wallet, label: 'Portfolio' },
  { href: '/community', icon: Users, label: 'Community' },
];

export function DashboardNav({ inSheet = false }: { inSheet?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex-1">
      <nav className="grid items-start gap-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-foreground',
              inSheet ? 'justify-start' : 'sm:justify-start justify-center',
              pathname === item.href && 'bg-sidebar-accent text-sidebar-primary-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span
              className={cn(
                'truncate',
                inSheet ? 'inline' : 'hidden sm:inline'
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto absolute bottom-4 w-full pr-4">
         <nav className="grid items-start gap-1">
             <Link
                href="/settings"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-foreground',
                  inSheet ? 'justify-start' : 'sm:justify-start justify-center',
                   pathname === '/settings' && 'bg-sidebar-accent text-sidebar-primary-foreground'
                )}
              >
                <Settings className="h-4 w-4" />
                <span
                  className={cn(
                    'truncate',
                    inSheet ? 'inline' : 'hidden sm:inline'
                  )}
                >
                  Settings
                </span>
              </Link>
         </nav>
      </div>
    </div>
  );
}
