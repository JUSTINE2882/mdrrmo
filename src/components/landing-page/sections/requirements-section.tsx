import { AlertTriangle, Award, IdCard } from 'lucide-react';

const RequirementsSection = () => {
  return (
    <section id="requirements" className="lg:px-6 md:px-6 sm:px-6">
      <div className="mx-auto lg:px-10 md:px-10 sm:px-10 px-6 py-20 max-w-6xl lg:rounded-lg sm:rounded-lg md:rounded-lg bg-gray-100">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-orange-500 uppercase">
            Documents
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900">
            What you&apos;ll need
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Prepare these documents before filling out your application
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              icon: IdCard,
              title: 'Valid Government ID',
              desc: "National ID, Voter's ID, Driver's License, or Passport",
              required: true,
            },
            {
              icon: Award,
              title: 'Training Certificate',
              desc: 'Disaster response, first aid, or any relevant certification',
              required: true,
            },
            // {
            //   icon: FileText,
            //   title: 'Barangay Clearance',
            //   desc: 'Issued within the last 3 months from your local barangay',
            //   required: true,
            // },
            // {
            //   icon: Heart,
            //   title: 'Medical Certificate',
            //   desc: 'Fit-to-work certificate from a licensed physician',
            //   required: true,
            // },
          ].map((req) => (
            <div
              key={req.title}
              className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-5 transition-all hover:border-orange-200 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                <req.icon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{req.title}</p>
                  {req.required ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                      Required
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-400">
                      Optional
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {req.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-700">
            All documents must be clear and legible. Blurry or incomplete
            submissions will be returned for re-upload.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RequirementsSection;
