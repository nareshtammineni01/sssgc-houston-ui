import Link from 'next/link';
import { Heart } from 'lucide-react';

const footerLinks = [
  {
    title: 'About',
    links: [
      { label: 'About Us', href: '/about' },
      { label: "I'm New Here", href: '/new-here' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Activities',
    links: [
      { label: 'Devotion', href: '/devotion' },
      { label: 'Educare', href: '/educare' },
      { label: 'Seva', href: '/seva' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Bhajan Library', href: '/resources' },
      { label: 'Calendar', href: '/calendar' },
      { label: 'Gallery', href: '/gallery' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-maroon-600 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gold-300 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-maroon-100 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-maroon-500" />

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-maroon-200">
              Sri Sathya Sai Center at Houston
            </p>
            <p className="text-xs text-maroon-300 mt-1">
              A 501(c)(3) non-profit organization &middot; Katy, TX 77494
            </p>
          </div>
          <p className="flex items-center gap-1 text-xs text-maroon-300">
            Made with <Heart size={12} className="text-saffron-400" /> in service
          </p>
        </div>
      </div>
    </footer>
  );
}
