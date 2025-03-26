'use client';

import { KindeProvider } from '@kinde-oss/kinde-auth-nextjs';
import SideNav from './_components/SideNav';
import Header from './_components/Header';
import AuthProvider from '../_components/AuthProvider';

export default function DashboardLayout({ children }) {
  return (
    <KindeProvider>
      <AuthProvider>
        <div className="flex min-h-screen bg-background">
          <div className="md:w-64 fixed hidden md:block">
            <SideNav />
          </div>
          <div className="flex-1 md:ml-64">
            <Header />
            <main className="p-4">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </KindeProvider>
  );
}