'use client';

import { Shared } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState, type MouseEvent } from 'react';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    setIsOpen(false);

    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);

    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      window.location.hash = href;
    }

    window.history.pushState(null, '', href);
  };

  return (
    <div className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md px-6">
      <div className="mx-auto flex py-5 max-w-6xl items-center justify-between">
        <Shared.Brand />
        <>
          <NavItems
            onClick={(event, href) => handleNavigate(event, href)}
            navStyle="hidden items-center gap-8 md:flex"
          />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="lg:hidden md:hidden"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <Shared.Brand />
              </SheetHeader>
              <SheetDescription asChild>
                <div className="flex flex-col items-start gap-4 ">
                  <div className="w-full px-4">
                    <NavItems
                      onClick={(event, href) => handleNavigate(event, href)}
                      navStyle="flex flex-col items-start gap-4"
                    />
                  </div>
                  <AuthButton
                    parentStyle="flex flex-col w-full pt-6 px-4 border-t border-gray-100"
                    link1="border w-full rounded-lg text-center"
                    link2="w-full text-center"
                  />
                </div>
              </SheetDescription>
              <SheetFooter>
                <Shared.CopyRight />
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <AuthButton parentStyle="hidden md:flex lg:flex" />
        </>
      </div>
    </div>
  );
};

export default NavBar;

interface Props {
  parentStyle?: string;
  link1?: string;
  link2?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  navStyle?: string;
}

const AuthButton = ({ parentStyle, link1, link2 }: Props) => {
  return (
    <div className={` items-center gap-2 ${parentStyle}`}>
      <Link
        href="/auth/login"
        className={` px-4 py-2 text-sm font-medium rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-orange-500 ${link1}`}
      >
        Sign In
      </Link>
      <Link
        href="/profile/apply"
        className={`rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 ${link2}`}
      >
        Apply Now
      </Link>
    </div>
  );
};

const NavItems = ({ onClick, navStyle }: Props) => {
  return (
    <nav className={navStyle}>
      {['How It Works', 'Requirements', 'Contact'].map((label) => {
        const href = `#${label.toLowerCase().replace(/\s+/g, '-')}`;
        return (
          <a
            key={label}
            href={href}
            onClick={(event) => onClick?.(event, href)}
            className="text-sm text-gray-500 transition-colors hover:text-orange-500"
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
};
