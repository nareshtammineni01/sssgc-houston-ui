'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Calendar,
  Image,
  Info,
  Heart,
  GraduationCap,
  HandHeart,
  UserCircle,
  Settings,
  Shield,
  HelpCircle,
  Mail,
  Megaphone,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNav = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Devotion', href: '/devotion', icon: Heart },
  { label: 'Educare', href: '/educare', icon: GraduationCap },
  { label: 'Seva', href: '/seva', icon: HandHeart },
  { label: 'Resources', href: '/resources', icon: BookOpen },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Announcements', href: '/announcements', icon: Megaphone },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const moreNav = [
  { label: 'About', href: '/about', icon: Info },
  { label: "I'm New Here", href: '/new-here', icon: HelpCircle },
  { label: 'Gallery', href: '/gallery', icon: Image },
  { label: 'Contact', href: '/contact', icon: Mail },
];

const adminNav = [
  { label: 'Admin Panel', href: '/admin', icon: Shield },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'member' | 'admin' | 'super_admin' | null;
  userName?: string | null;
}

export default function Sidebar({ isOpen, onClose, userRole, userName }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white',
          'w-[220px] flex flex-col transition-transform duration-300',
          'border-r border-[rgba(107,29,42,0.1)]',
          'lg:translate-x-0 lg:z-30',
          'md:hidden lg:flex',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo — gradient circle + text */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[rgba(107,29,42,0.1)]">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8860C] to-[#6B1D2A] flex items-center justify-center text-white font-heading text-lg font-semibold">
              S
            </div>
            <div>
              <div className="font-heading text-sm font-semibold text-[#6B1D2A] leading-tight">
                SSSGC Houston
              </div>
              <div className="text-[9px] text-[#A89888] uppercase tracking-wider">
                Love all serve all
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1 rounded-md hover:bg-[#FDF8F0]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150',
                isActive(item.href)
                  ? 'bg-[#6B1D2A] text-white'
                  : 'text-[#7A6B5F] hover:bg-[#FDF8F0] hover:text-[#2C1810]'
              )}
            >
              <item.icon size={15} />
              <span className="flex-1">{item.label}</span>
            </Link>
          ))}

          {/* More section */}
          <div className="mt-4 mb-1 px-3">
            <span className="text-[10px] font-medium text-[#A89888] uppercase tracking-wider">
              More
            </span>
          </div>
          {moreNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150',
                isActive(item.href)
                  ? 'bg-[#6B1D2A] text-white'
                  : 'text-[#7A6B5F] hover:bg-[#FDF8F0] hover:text-[#2C1810]'
              )}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}

          {/* Admin links */}
          {(userRole === 'admin' || userRole === 'super_admin') && (
            <>
              <div className="mt-4 mb-1 px-3">
                <span className="text-[10px] font-medium text-[#A89888] uppercase tracking-wider">
                  Admin
                </span>
              </div>
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150',
                    isActive(item.href)
                      ? 'bg-[#6B1D2A] text-white'
                      : 'text-[#7A6B5F] hover:bg-[#FDF8F0] hover:text-[#2C1810]'
                  )}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User profile at bottom — matches mockup */}
        {userName && (
          <div className="px-4 py-3 border-t border-[rgba(107,29,42,0.1)] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center text-[13px] font-medium text-[#E8860C]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#2C1810] truncate">{userName}</div>
              <div className="text-[10px] text-[#A89888] capitalize">
                {userRole?.replace('_', ' ') ?? 'Member'}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
