'use client';

import { useState } from 'react';
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
  UserCog,
  Shield,
  Settings,
  HelpCircle,
  Mail,
  Megaphone,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string; icon: typeof Home };
type NavItemWithSub = NavItem & {
  children?: { label: string; href: string }[];
  /** Extra path prefixes that count as "in this section" */
  matchPrefixes?: string[];
};

const mainNav: NavItemWithSub[] = [
  { label: 'Home', href: '/', icon: Home },
  {
    label: 'Devotion',
    href: '/devotion',
    icon: Heart,
    children: [
      { label: 'Overview', href: '/devotion' },
      { label: 'Bhajan / Arathi Signups', href: '/devotion/bhajan-signups' },
      { label: 'Devotional Resources', href: '/devotion/resources' },
      { label: 'Special Events', href: '/devotion/special-events' },
    ],
  },
  {
    label: 'Educare',
    href: '/educare',
    icon: GraduationCap,
    children: [
      { label: 'Overview', href: '/educare' },
      { label: 'Announcements', href: '/educare/announcements' },
      { label: 'Meet the Gurus', href: '/educare/meet-the-gurus' },
      { label: 'Resources', href: '/educare/resources' },
      { label: 'Online Classes', href: '/educare/online-classes' },
      { label: 'Bhajan Tutor Signup', href: '/educare/bhajan-tutor-signup' },
    ],
  },
  {
    label: 'Seva',
    href: '/seva',
    icon: HandHeart,
    matchPrefixes: ['/seva', '/service'],
    children: [
      { label: 'Overview', href: '/seva' },
      { label: 'Service Projects', href: '/service' },
    ],
  },
  { label: 'Resources', href: '/resources', icon: BookOpen },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Announcements', href: '/announcements', icon: Megaphone },
];

const authNav = [
  { label: 'Profile', href: '/profile', icon: UserCog },
];

const moreNav = [
  { label: 'About', href: '/about', icon: Info },
  { label: "I'm New Here", href: '/new-here', icon: HelpCircle },
  { label: 'Gallery', href: '/gallery', icon: Image },
  { label: 'Contact', href: '/contact', icon: Mail },
];

const adminNav = [
  { label: 'Admin Panel', href: '/admin', icon: Shield },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

/** Check if current path is within a nav item's section */
function isInSection(pathname: string, item: NavItemWithSub): boolean {
  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some((p) => pathname.startsWith(p));
}

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

  // Track which expandable sections are open
  // Auto-expand any section the user is currently in
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    mainNav.forEach((item) => {
      if (item.children) {
        initial[item.href] = isInSection(pathname, item);
      }
    });
    return initial;
  });

  const toggleSection = (href: string) => {
    setExpandedSections((prev) => ({ ...prev, [href]: !prev[href] }));
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
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[rgba(107,29,42,0.1)]">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <img src="/sss-logo.webp" alt="SSSGC Logo" className="w-9 h-9 rounded-lg object-cover" />
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
          {mainNav.map((item) => {
            // Expandable item with children
            if (item.children) {
              const inSection = isInSection(pathname, item);
              const isExpanded = expandedSections[item.href] ?? false;

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (inSection) {
                        // Already in this section — just toggle dropdown
                        e.preventDefault();
                        toggleSection(item.href);
                      } else {
                        // Navigate to overview and expand
                        setExpandedSections((prev) => ({ ...prev, [item.href]: true }));
                        onClose();
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150',
                      inSection
                        ? 'bg-[#6B1D2A] text-white'
                        : 'text-[#7A6B5F] hover:bg-[#FDF8F0] hover:text-[#2C1810]'
                    )}
                  >
                    <item.icon size={20} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </Link>

                  {/* Sub-items */}
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200',
                      isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="ml-[22px] pl-3 border-l border-[rgba(107,29,42,0.1)] mt-0.5 mb-1 space-y-0.5">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              'block px-3 py-[7px] rounded-md text-[12px] transition-all duration-150',
                              childActive
                                ? 'bg-[#FDF8F0] text-[#6B1D2A] font-medium'
                                : 'text-[#7A6B5F] hover:bg-[#FDF8F0] hover:text-[#2C1810]'
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Regular item
            return (
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
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}

          {/* Profile — only when logged in */}
          {userName && authNav.map((item) => (
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
              <item.icon size={20} />
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
              <item.icon size={20} />
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
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User profile at bottom */}
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
