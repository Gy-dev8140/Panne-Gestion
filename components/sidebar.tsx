'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PenTool, Users, FileText, Settings, LogOut, Computer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';

const routes = [
  {
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Dossiers',
    icon: PenTool,
    href: '/dashboard/repairs',
    color: 'text-violet-500',
  },
  {
    label: 'Clients',
    icon: Users,
    href: '/dashboard/customers',
    color: 'text-pink-700',
  },
  {
    label: 'Appareils',
    icon: Computer,
    href: '/dashboard/devices',
    color: 'text-emerald-500',
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            IT BUSINESS
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                pathname === route.href || pathname.startsWith(route.href + '/')
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 pb-4">
        <Button onClick={() => signOut({ callbackUrl: '/' })} variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10">
          <LogOut className="h-5 w-5 mr-3 text-red-400" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};
