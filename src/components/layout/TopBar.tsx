'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, User, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TopBarProps {
  onMenuClick: () => void;
  userName?: string | null;
  avatarUrl?: string | null;
}

interface Announcement {
  id: string;
  title: string;
  body_plain: string | null;
  category: string;
  published_at: string;
}

export default function TopBar({ onMenuClick, userName, avatarUrl }: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch recent announcements
  useEffect(() => {
    fetchAnnouncements();

    // Real-time subscription for new announcements
    const channel = supabase
      .channel('topbar-announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchAnnouncements() {
    const { data, count } = await supabase
      .from('announcements')
      .select('id, title, body_plain, category, published_at', { count: 'exact' })
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(5);

    setAnnouncements(data ?? []);

    // Count announcements from last 7 days as "unread"
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = (data ?? []).filter(
      (a) => new Date(a.published_at) > weekAgo
    );
    setUnreadCount(recent.length);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/resources?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  }

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const categoryDotColor: Record<string, string> = {
    devotion: '#6B1D2A',
    educare: '#2563EB',
    seva: '#16A34A',
    general: '#E8860C',
  };

  return (
    <header
      className="sticky top-0 z-30 bg-white border-b border-[rgba(107,29,42,0.1)] flex items-center justify-between px-4 md:px-6"
      style={{ height: '58px' }}
    >
      {/* Left: hamburger (mobile/tablet) + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#FDF8F0] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-[#7A6B5F]" />
        </button>

        {/* Mobile logo */}
        <Link href="/" className="md:hidden flex items-center gap-1.5">
          <img src="/sss-logo.webp" alt="SSSGC Logo" className="w-7 h-7 rounded-full object-cover" />
          <span className="text-sm font-heading font-semibold text-[#6B1D2A]">SSSGC</span>
        </Link>

        {/* Desktop search bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-[#FDF8F0] border border-[rgba(107,29,42,0.1)] rounded-lg px-3.5 py-2 w-[360px]">
          <Search size={14} className="text-[#A89888] flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bhajans, prayers, events, members..."
            className="bg-transparent w-full text-[13px] text-[#2C1810] placeholder:text-[#A89888] focus:outline-none"
          />
        </form>
      </div>

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="absolute inset-0 z-40 bg-white flex items-center px-4 gap-2" style={{ height: '58px' }}>
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-[#FDF8F0] border border-[rgba(107,29,42,0.1)] rounded-lg px-3.5 py-2">
            <Search size={14} className="text-[#A89888] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent w-full text-[13px] text-[#2C1810] placeholder:text-[#A89888] focus:outline-none"
              autoFocus
            />
          </form>
          <button
            onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }}
            className="p-2 rounded-lg hover:bg-[#FDF8F0]"
          >
            <X size={18} className="text-[#7A6B5F]" />
          </button>
        </div>
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-2.5">
        {/* Mobile search trigger */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="md:hidden w-[34px] h-[34px] rounded-full bg-[#FDF8F0] flex items-center justify-center"
        >
          <Search size={15} className="text-[#7A6B5F]" />
        </button>

        {/* Notification bell with dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadCount(0);
            }}
            className="w-[34px] h-[34px] rounded-full bg-[#FDF8F0] flex items-center justify-center"
          >
            <Bell size={15} className="text-[#7A6B5F]" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-[15px] h-[15px] rounded-full bg-[#E8860C] text-white text-[9px] font-medium flex items-center justify-center">
              {unreadCount}
            </span>
          )}

          {/* Dropdown panel */}
          {showNotifications && (
            <div className="absolute right-0 top-[42px] w-[340px] bg-white rounded-xl shadow-lg border border-[rgba(107,29,42,0.1)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[rgba(107,29,42,0.08)] flex items-center justify-between">
                <span className="text-[13px] font-semibold" style={{ color: '#2C1810' }}>
                  Notifications
                </span>
                <Link
                  href="/announcements"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-medium"
                  style={{ color: '#E8860C' }}
                >
                  View all
                </Link>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {announcements.length > 0 ? (
                  announcements.map((a) => (
                    <Link
                      key={a.id}
                      href={`/announcements/${a.id}`}
                      onClick={() => setShowNotifications(false)}
                      className="flex gap-3 px-4 py-3 hover:bg-[#FDF8F0] transition-colors border-b border-[rgba(107,29,42,0.05)] last:border-0"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: categoryDotColor[a.category] ?? '#E8860C' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate" style={{ color: '#2C1810' }}>
                          {a.title}
                        </p>
                        {a.body_plain && (
                          <p className="text-[11px] truncate mt-0.5" style={{ color: '#7A6B5F' }}>
                            {a.body_plain.slice(0, 80)}
                          </p>
                        )}
                        <p className="text-[10px] mt-1" style={{ color: '#A89888' }}>
                          {formatTimeAgo(a.published_at)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="mx-auto mb-2" style={{ color: '#A89888' }} />
                    <p className="text-[12px]" style={{ color: '#7A6B5F' }}>No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
