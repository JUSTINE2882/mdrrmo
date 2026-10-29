import { images } from '@/constant/images';
import { ChevronRight, Shield } from 'lucide-react';
import Link from 'next/link';

const logoImageUrl =
  typeof images.logo === 'string' ? images.logo : images.logo.src;

const HeroSection = () => {
  return (
    <section className="relative px-6 pt-20 pb-28">
      <div className="pointer-events-none max-w-6xl mx-auto absolute inset-0 overflow-hidden">
        <div className="absolute -top-80 -right-80 lg:h-240 lg:w-240 md:h-235 md:w-235 w-230 h-230 rounded-full border border-orange-100/90" />
        <div className="absolute -top-60 -right-60 lg:h-190 lg:w-190 md:h-185 md:w-185 w-180 h-180 rounded-full border border-orange-200/80" />
        <div className="absolute -top-40 -right-40 lg:h-140 lg:w-140 md:h-135 md:w-135 w-130 h-130 rounded-full border border-orange-300/70" />
        <div className="absolute -top-20 -right-20 lg:h-90 lg:w-90 md:h-85 md:w-85 w-80 h-80 rounded-full border border-orange-400/60" />
        <div
          style={{ backgroundImage: `url('${logoImageUrl}')` }}
          className="absolute top-0 right-0 -rotate-20 lg:h-40 lg:w-40 md:h-30 md:w-30 w-30 h-30 bg-contain border-2 border-orange-500 rounded-b-full bg-center bg-no-repeat opacity-10"
        />
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
          <Shield className="h-3 w-3 text-orange-500" />
          <span className="text-xs font-semibold tracking-wide text-orange-600 uppercase">
            Municipality Disaster Risk Reduction & Management Office
          </span>
        </div>

        <h1 className="mx-auto max-w-3xl text-5xl leading-[1.08] font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Serve your community.{' '}
          <span className="text-orange-500">Become a volunteer.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
          Join MDRRMO&apos;s network of certified disaster responders. Apply
          online, submit your documents, and be ready when your community needs
          you most.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/profile/apply"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200/60 transition-all hover:-translate-y-0.5 hover:bg-orange-600"
          >
            Apply as Volunteer
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            Track My Application
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
