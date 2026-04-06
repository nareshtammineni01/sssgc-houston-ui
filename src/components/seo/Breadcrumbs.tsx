import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbJsonLd } from './JsonLd';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ name: 'Home', href: '/' }, ...items];

  return (
    <>
      <BreadcrumbJsonLd items={allItems} />
      <nav aria-label="Breadcrumb" className="mb-1">
        <ol className="flex items-center gap-1.5 text-[14px] flex-wrap" style={{ color: '#A89888' }}>
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight size={12} className="flex-shrink-0" style={{ color: '#D1C7BC' }} />
                )}
                {index === 0 && (
                  <Home size={12} className="flex-shrink-0" />
                )}
                {isLast ? (
                  <span className="font-medium truncate max-w-[200px]" style={{ color: '#2C1810' }}>
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:underline truncate max-w-[200px] transition-colors"
                    style={{ color: '#E8860C' }}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
