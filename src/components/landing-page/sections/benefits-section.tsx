import { Award, Clock, Star } from 'lucide-react';

const BenefitsSection = () => {
  return (
    <section className="lg:px-6 md:px-6 sm:px-6">
      <div className="mx-auto max-w-6xl px-6 lg:px-0 md:px-0 sm:px-0 py-20">
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-orange-500 uppercase">
            Benefits
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Why volunteer with MDRRMO?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              icon: Star,
              title: 'Official Accreditation',
              desc: 'Receive an MDRRMO volunteer ID and certificate recognized by the LGU.',
            },
            {
              icon: Clock,
              title: 'Flexible Commitment',
              desc: "Respond when you're available. We work around your schedule, not the other way around.",
            },
            {
              icon: Award,
              title: 'Free Training Programs',
              desc: 'Access disaster response, first aid, and leadership trainings at no cost.',
            },
          ].map((b) => (
            <div
              key={b.title}
              className="group rounded-lg border border-gray-100 p-6 transition-all hover:border-orange-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 transition-transform group-hover:scale-105">
                <b.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 text-sm font-bold text-gray-900">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
