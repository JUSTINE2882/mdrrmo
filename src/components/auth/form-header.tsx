import { images } from '@/constant/images';
import Image from 'next/image';

interface props {
  description: string;
}

const AuthHeader = ({ description }: props) => {
  return (
    <div className="flex flex-col shadow  gap-1 text-orange-500 text-center py-3">
      <div className="flex items-center justify-center gap-1">
        <Image src={images.logo} alt="LOGO" className="h-8 w-8" />
        <p className=" font-semibold text-xl">VOLUNTEER PORTAL</p>
      </div>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
};

export default AuthHeader;
