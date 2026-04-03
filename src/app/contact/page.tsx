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
              <a
                href="https://maps.app.goo.gl/yE2tfuj9T891LKTs6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-saffron-600 transition-colors"
              >
                Kids R Kids Learning Academy
                <br />
                4515 FM 1463
                <br />
                Katy, TX 77494
              </a>
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

        {/* Embedded Google Map */}
        <div className="card overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110871.78879613179!2d-95.99810600280763!3d29.727191279735074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864123bd2d8287a7%3A0x127ccfad330c9760!2sKids%20%27R%27%20Kids%20Learning%20Academy%20of%20Cardiff%20Ranch!5e0!3m2!1sen!2sus!4v1775245215171!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '320px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sri Sathya Sai Center at Houston - Kids R Kids Learning Academy of Cardiff Ranch"
          />
        </div>
      </div>
    </div>
  );
}
