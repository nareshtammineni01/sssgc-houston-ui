'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Calendar,
  Heart,
  GraduationCap,
  HandHeart,
  UserCircle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const railItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Devotion', href: '/devotion', icon: Heart },
  { label: 'Educare', href: '/educare', icon: GraduationCap },
  { label: 'Seva', href: '/seva', icon: HandHeart },
  { label: 'Resources', href: '/resources', icon: BookOpen },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
];

const railMemberItems = [
  { label: 'Profile', href: '/dashboard', icon: UserCircle },
];

const railAdminItems = [
  { label: 'Admin', href: '/admin', icon: Shield },
];

interface IconRailProps {
  userRole?: 'member' | 'admin' | 'super_admin' | null;
}

export default function IconRail({ userRole }: IconRailProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex lg:hidden fixed top-0 left-0 z-30 h-full w-[64px] bg-white border-r border-[rgba(107,29,42,0.1)] flex-col items-center py-3 gap-1">
      {/* Logo — gradient circle */}
      <Link href="/" className="mb-3">
        <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#E8860C] to-[#6B1D2A] flex items-center justify-center text-white font-heading text-base font-semibold">
          S
        </div>
      </Link>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {railItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-[42px] h-[42px] rounded-lg text-[16px] transition-all duration-150 gap-0.5',
              isActive(item.href)
                ? 'bg-[#6B1D2A] text-white'
                : 'text-[#7A6B5F] hover:bg-[#FDF8F0]'
            )}
            title={item.label}
          >
            <item.icon size={16} />
            <span className="text-[8px] leading-none">{item.label}</span>
          </Link>
        ))}

        {/* Member items */}
        {userRole && (
          <>
            <div className="w-8 h-px bg-[rgba(107,29,42,0.1)] my-1" />
            {railMemberItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-[42px] h-[42px] rounded-lg text-[16px] transition-all duration-150 gap-0.5',
                  isActive(item.href)
                    ? 'bg-[#6B1D2A] text-white'
                    : 'text-[#7A6B5F] hover:bg-[#FDF8F0]'
                )}
                title={item.label}
              >
                <item.icon size={16} />
                <span className="text-[8px] leading-none">{item.label}</span>
              </Link>
            ))}
          </>
        )}

        {/* Admin items */}
        {(userRole === 'admin' || userRole === 'super_admin') && (
          <>
            <div className="w-8 h-px bg-[rgba(107,29,42,0.1)] my-1" />
            {railAdminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-[42px] h-[42px] rounded-lg text-[16px] transition-all duration-150 gap-0.5',
                  isActive(item.href)
                    ? 'bg-[#6B1D2A] text-white'
                    : 'text-[#7A6B5F] hover:bg-[#FDF8F0]'
                )}
                title={item.label}
              >
                <item.icon size={16} />
                <span className="text-[8px] leading-none">{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
