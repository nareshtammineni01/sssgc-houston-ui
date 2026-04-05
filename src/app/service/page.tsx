import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Service – Sri Sathya Sai Center Houston',
  description:
    'Service to Man is Service to God. Learn about our special service projects and upcoming seva activities.',
};

const SPECIAL_PROJECTS = [
  {
    title: 'Organic Garden Seva',
    description: 'Making organic garden beds at homes and communities',
  },
  {
    title: 'Animal Shelter Service',
    description: 'Support needs of animal shelter a couple of times in the year',
  },
  {
    title: 'School Supplies / Clothing Donation',
    description:
      'Support homeless and socioeconomically disadvantaged communities 2–3 times a year',
  },
  {
    title: 'Tutoring Service',
    description: 'At 2 downtown schools when requested',
  },
  {
    title: 'Go-Green Awareness',
    description: 'Refuse / Reduce / Reuse / Recycle / Repurpose',
  },
  {
    title: 'Medical / Health Care / Screening / CME / Camps',
    description: 'Please reach out to the Regional Medical Director, Dr. Guntupalli',
    contactEmail: 'kguntapalli@gmail.com',
  },
];

export default function ServicePage() {
  return (
    <div className="page-enter max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-h1 mb-2">Service Projects</h1>
        <p className="text-[17px]" style={{ color: '#7A6B5F' }}>
          Ongoing and upcoming seva activities serving the greater Houston community.
        </p>
      </div>

      {/* Upcoming Seva Activities */}
      <section>
        <h2
          className="text-[18px] mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            color: '#2C1810',
          }}
        >
          Upcoming Seva Activities
        </h2>
        <div
          className="px-5 py-6 rounded-xl text-center"
          style={{ background: '#FDF8F0', border: '1px dashed rgba(232,134,12,0.3)' }}
        >
          <p className="text-[15px]" style={{ color: '#A89888' }}>
            No upcoming activities scheduled yet. Check back soon!
          </p>
        </div>
      </section>

      {/* Special Service Projects */}
      <section>
        <h2
          className="text-[18px] mb-5"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            color: '#2C1810',
          }}
        >
          Special Service Projects
        </h2>
        <div className="space-y-3">
          {SPECIAL_PROJECTS.map((project) => (
            <div
              key={project.title}
              className="px-5 py-4 rounded-xl border transition-colors hover:border-[rgba(232,134,12,0.3)]"
              style={{
                background: '#FFFFFF',
                borderColor: 'rgba(107,29,42,0.08)',
              }}
            >
              <h3
                className="text-[17px] font-semibold mb-1.5"
                style={{ color: '#2C1810' }}
              >
                {project.title}
              </h3>
              <p className="text-[15px] leading-relaxed" style={{ color: '#7A6B5F' }}>
                {project.description}
              </p>
              {project.contactEmail && (
                <a
                  href={`mailto:${project.contactEmail}`}
                  className="inline-flex items-center gap-1.5 mt-2 text-[14px] font-medium transition-colors hover:underline"
                  style={{ color: '#E8860C' }}
                >
                  <Mail size={12} />
                  {project.contactEmail}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
