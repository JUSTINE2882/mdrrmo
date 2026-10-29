import { Icons } from '@/constant/icons';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <title>404 | MDRRMO</title>

      <div className="flex min-h-screen w-full items-center justify-center bg-orange-100 px-6 py-12">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-4 bg-orange-500 px-10 py-16">
              <Image
                src={Icons.error}
                alt="404 Not Found"
                width={260}
                height={260}
                priority
                className="h-auto w-52 md:w-60"
              />
              <p className="text-center text-sm font-semibold tracking-widest text-orange-200 uppercase">
                Error 404
              </p>
            </div>

            <div className="flex flex-col justify-center px-10 py-14">
              <span className="mb-5 inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-100 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-orange-500 uppercase">
                MDRRMO Portal
              </span>

              <h1 className="mb-4 text-3xl leading-tight font-extrabold tracking-tight text-gray-900">
                Page Not Found
              </h1>

              <p className="mb-8 text-sm leading-relaxed text-gray-500">
                The page you are looking for may have been moved, deleted, or
                the URL may be incorrect. Return to the homepage to continue
                accessing MDRRMO services and information.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="rounded-lg bg-orange-500 px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-orange-700"
                >
                  Return Home
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  Contact MDRRMO
                </Link>
              </div>

              <div className="mt-10 space-y-0.5 border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400">
                  Municipality Disaster Risk Reduction and Management Office
                </p>
                <p className="text-xs font-medium tracking-wide text-gray-400">
                  Prepared · Responsive · Resilient
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
