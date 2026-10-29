import { images } from '@/constant/images';
import { Shield, Users, Zap } from 'lucide-react';

const logoImageUrl =
  typeof images.logo === 'string' ? images.logo : images.logo.src;
const FormSidePanel = () => {
  return (
    <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-linear-to-br from-orange-500 via-orange-400 to-amber-300 px-12 lg:flex">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-white/10" />
      <div className="absolute top-1/3 -right-8 h-32 w-32 rounded-full bg-white/10" />

      <div
        style={{ backgroundImage: `url('${logoImageUrl}')` }}
        className=" lg:h-40 lg:w-40 md:h-30 md:w-30 w-30 h-30 bg-contain border border-white rounded-b-full bg-center bg-no-repeat opacity-70"
      />

      <div className="relative z-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">
          MDRRMO
        </h1>
        <p className="mt-1 text-base font-semibold text-white/80">
          Volunteer Management System
        </p>
        <div className="mx-auto mt-4 h-px w-16 bg-white/40" />
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
          Empowering communities through coordinated disaster risk reduction and
          emergency response.
        </p>
      </div>

      <div className="relative z-10 mt-10 flex flex-col gap-3">
        {[
          { icon: Shield, label: 'Disaster Risk Reduction' },
          { icon: Users, label: 'Volunteer Coordination' },
          { icon: Zap, label: 'Real-time Response' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/25">
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-white">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormSidePanel;
