'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Calendar, Heart, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const bottomTabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Resources', href: '/resources', icon: BookOpen },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Devotion', href: '/devotion', icon: Heart },
  { label: 'Profile', href: '/profile', icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[rgba(107,29,42,0.1)]">
      <ul className="flex items-center justify-around h-16 px-1">
        {bottomTabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-14 rounded-lg text-xs transition-colors',
                isActive(tab.href)
                  ? 'text-[#E8860C]'
                  : 'text-[#A89888] hover:text-[#7A6B5F]'
              )}
            >
              <tab.icon size={20} strokeWidth={isActive(tab.href) ? 2.5 : 1.5} />
              <span className="mt-1 text-[10px] font-medium">{tab.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
