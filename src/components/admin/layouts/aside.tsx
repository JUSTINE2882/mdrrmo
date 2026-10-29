'use client';

import { Shared } from '@/components/shared';
import { Building2, FileClock, Layers, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import navigation from '@/data/admin/navigation';

const managementNavigation = [
  { name: 'Records', href: '/admin/dashboard/records', icon: Layers },
  { name: 'Activity Logs', href: '/admin/dashboard/logs', icon: FileClock },
];

function Aside() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/admin/dashboard' && pathname.startsWith(href));

  return (
    <>
      <div className="absolute z-50 top-3 left-4 p-0">
        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden "
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-gray-100 bg-white shadow-xl transition-transform duration-300 md:static md:translate-x-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Shared.Brand
          menuButton={
            <button
              className="rounded-lg p-2 text-gray-500 md:hidden hover:bg-gray-100 "
              onClick={() => setSidebarOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </button>
          }
          parentStyle="h-16 border-b border-gray-200 px-6"
        />

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pt-2 pb-4">
          <div className="space-y-0.5">
            <p className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Main Menu
            </p>
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-0.5">
            <p className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Records &amp; Insights
            </p>
            {managementNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Building2 className="h-3 w-3" />
            <span>MDRRMO Mansalay © 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Aside;
