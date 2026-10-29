import { CheckCircle, FileText, Users } from 'lucide-react';

const ProcessSection = () => {
  return (
    <section id="how-it-works" className="lg:px-6 md:px-6 sm:px-6">
      <div className="mx-auto max-w-6xl lg:px-0 md:px-0 sm:px-0 px-6 py-24">
        <div className="mb-16 text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-orange-500 uppercase">
            Process
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Three steps to join
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="absolute top-8 right-1/4 left-1/4 hidden h-px bg-gray-200 sm:block" />

          {[
            {
              step: '01',
              title: 'Create an account',
              desc: 'Register with your email or continue with Google. Takes under a minute.',
              icon: Users,
              bg: 'bg-blue-50',
              iconColor: 'text-blue-500',
            },
            {
              step: '02',
              title: 'Fill the application',
              desc: 'Complete your personal information and upload the required documents.',
              icon: FileText,
              bg: 'bg-orange-50',
              iconColor: 'text-orange-500',
            },
            {
              step: '03',
              title: 'Await approval',
              desc: 'Our staff reviews your submission and notifies you within 3–5 business days.',
              icon: CheckCircle,
              bg: 'bg-green-50',
              iconColor: 'text-green-600',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg}`}
                >
                  <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                </div>
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white">
                  {item.step.slice(1)}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
