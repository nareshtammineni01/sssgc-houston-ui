'use client';

import Link from 'next/link';
import { Menu, Search, Bell, User } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  userName?: string | null;
  avatarUrl?: string | null;
}

export default function TopBar({ onMenuClick, userName, avatarUrl }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-30 bg-white border-b border-[rgba(107,29,42,0.1)] flex items-center justify-between px-4 md:px-6"
      style={{ height: '58px' }}
    >
      {/* Left: hamburger (mobile/tablet) + search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#FDF8F0] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-[#7A6B5F]" />
        </button>

        {/* Mobile logo */}
        <Link href="/" className="md:hidden flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8860C] to-[#6B1D2A] flex items-center justify-center text-white font-heading text-sm font-semibold">
            S
          </div>
          <span className="text-sm font-heading font-semibold text-[#6B1D2A]">SSSGC</span>
        </Link>

        {/* Search bar — matches mockup */}
        <div className="hidden md:flex items-center gap-2 bg-[#FDF8F0] border border-[rgba(107,29,42,0.1)] rounded-lg px-3.5 py-2 w-[360px]">
          <Search size={14} className="text-[#A89888] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search bhajans, prayers, events, members..."
            className="bg-transparent w-full text-[13px] text-[#2C1810] placeholder:text-[#A89888] focus:outline-none"
          />
        </div>
      </div>

      {/* Right: actions — matches mockup circles */}
      <div className="flex items-center gap-2.5">
        {/* Mobile search */}
        <button className="md:hidden w-[34px] h-[34px] rounded-full bg-[#FDF8F0] flex items-center justify-center">
          <Search size={15} className="text-[#7A6B5F]" />
        </button>

        {/* Notification bell with badge */}
        <div className="relative">
          <button className="w-[34px] h-[34px] rounded-full bg-[#FDF8F0] flex items-center justify-center">
            <Bell size={15} className="text-[#7A6B5F]" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-[15px] h-[15px] rounded-full bg-[#E8860C] text-white text-[9px] font-medium flex items-center justify-center">
            3
          </span>
        </div>

        {/* Profile icon */}
        <Link href="/dashboard">
          <div className="w-[34px] h-[34px] rounded-full bg-[#FDF8F0] flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={15} className="text-[#7A6B5F]" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
