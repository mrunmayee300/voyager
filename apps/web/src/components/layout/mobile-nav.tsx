'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, FileText, LayoutDashboard, MapPin, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/planner', icon: Compass, label: 'Plan' },
  { href: '/visa', icon: FileText, label: 'Visa' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Trips' },
  { href: '/centers', icon: MapPin, label: 'Centers' },
  { href: '/assistant', icon: MessageCircle, label: 'Ask' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sand-200 bg-white/95 backdrop-blur md:hidden">
      <div className="flex justify-around py-2">
        {items.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]',
              pathname.startsWith(href) ? 'text-ocean-700' : 'text-sand-800/60',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
