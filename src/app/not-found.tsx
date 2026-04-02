import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-enter flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-heading font-bold text-maroon-600 mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-6">
        This page could not be found.
      </p>
      <Link href="/" className="btn-primary">
        <Home size={18} className="mr-2" />
        Back to Home
      </Link>
    </div>
  );
}
