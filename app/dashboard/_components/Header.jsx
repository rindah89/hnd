"use client"
import Image from 'next/image';
import React from 'react';
import { useAuth } from '../../_components/AuthProvider';
import { LogOut, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function Header() {
  const { user, refreshToken, isLoading } = useAuth();
  
  const handleRefresh = async () => {
    await refreshToken();
  };
  
  return (
    <div className='p-4 shadow-sm border flex justify-between items-center'>
      <div>
        <h1 className="text-xl font-semibold text-gray-700">Student Attendance Tracking</h1>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleRefresh} 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          disabled={isLoading}
          title="Refresh auth token"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
        
        <Link 
          href="/api/auth/logout" 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          title="Logout"
        >
          <LogOut size={18} />
        </Link>
        
        {user?.picture && (
          <Image 
            src={user.picture} 
            width={35} 
            height={35}
            alt='user'
            className='rounded-full'
          />
        )}
      </div>
    </div>
  )
}

export default Header