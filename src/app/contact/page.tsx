import type { Metadata } from 'next';
import { MapPin, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Sri Sathya Sai Center at Houston.',
};

export default function ContactPage() {
  return (
    <div className="page-enter max-w-3xl mx-auto space-y-8">
      <h1 className="text-h1">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-5">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-saffron-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Location</h3>
              <p className="text-sm text-gray-600">
                Kids R Kids Learning Academy
                <br />
                4515 FM 1463
                <br />
                Katy, TX 77494
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock size={20} className="text-saffron-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Weekly Gathering</h3>
              <p className="text-sm text-gray-600">
                Sundays, 10:00 AM &ndash; 1:00 PM
                <br />
                All activities are free and open to everyone.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={20} className="text-saffron-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Email</h3>
              <a
                href="mailto:info@sssgc-houston.org"
                className="text-sm text-saffron-600 hover:text-saffron-700"
              >
                info@sssgc-houston.org
              </a>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="card overflow-hidden">
          <div className="aspect-square bg-cream-200 flex items-center justify-center">
            <p className="text-sm text-gray-400">Map embed goes here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
