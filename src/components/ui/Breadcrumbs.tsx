'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Client } from '@/lib/types';

interface BreadcrumbsProps {
  clientName?: string;
  clients?: Client[];
}

export default function Breadcrumbs({ clientName, clients }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Skip breadcrumbs on the dashboard
  if (pathname === '/freelancer/dashboard' || pathname === '/freelancer') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb trail from path segments
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;

    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Humanize segment names
    if (segment === 'freelancer') label = 'Home';
    if (segment === 'workspace') label = 'Workspace';
    if (segment === 'dashboard') continue; // Skip dashboard in breadcrumb
    if (segment === 'settings') label = 'Settings';
    if (segment === 'activity') label = 'Activity';
    if (segment === 'clients') label = 'Clients';
    if (segment === 'projects') label = 'Projects';
    if (segment === 'invoices') label = 'Invoices';

    // Check if this segment is a client ID
    if (clients && segment.match(/^cl_/) && i > 0) {
      const client = clients.find(c => c.id === segment);
      label = client?.name || 'Client';
    }

    breadcrumbs.push({ label, href, isLast });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-500 font-medium select-none">
      <Link
        href="/freelancer/dashboard"
        className="hover:text-gray-900 transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {breadcrumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          {crumb.isLast ? (
            <span className="text-gray-900 font-semibold truncate max-w-[150px]">
              {clientName && idx === breadcrumbs.length - 1 ? clientName : crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-gray-900 transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
