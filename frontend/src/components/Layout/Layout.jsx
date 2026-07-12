import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const mainNavigation = [
    { name: 'Fleet Overview', href: '/dashboard', icon: 'dashboard', roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Vehicle Tracking', href: '/vehicles', icon: 'location_on', roles: ['Fleet Manager', 'Dispatcher', 'Financial Analyst'] },
    { name: 'Maintenance Logs', href: '/maintenance', icon: 'build', roles: ['Fleet Manager', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Driver Schedules', href: '/drivers', icon: 'calendar_today', roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
    { name: 'Driver Verification', href: '/driver-verification', icon: 'verified_user', roles: ['Fleet Manager'] },
    { name: 'Trips', href: '/trips', icon: 'route', roles: ['Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Fuel & Expenses', href: '/fuel', icon: 'local_gas_station', roles: ['Financial Analyst'] },
    { name: 'Analytics', href: '/reports', icon: 'bar_chart', roles: ['Safety Officer', 'Financial Analyst'] },
  ];

  const driverNavigation = [
    { name: 'Active Trip', href: '/driver-portal', icon: 'directions_car' },
    { name: 'Trip History', href: '/driver/history', icon: 'history' },
    { name: 'My Profile', href: '/driver/profile', icon: 'person' },
  ];

  const filteredNav = user?.role === 'Driver' 
    ? driverNavigation 
    : mainNavigation.filter(item => hasRole(item.roles));

  return (
    <div className="bg-background text-on-surface flex min-h-screen">
      
      {/* Sidebar Navigation */}
      <aside className="fixed h-full w-sidebar-width left-0 top-0 bg-inverse-surface flex flex-col border-r border-outline-variant z-50">
        <div className="p-lg">
          <h1 className="font-headline-md text-headline-md font-bold text-white tracking-tight">TransitOps</h1>
          <p className="text-secondary-fixed-dim text-label-sm uppercase tracking-widest mt-xs">Fleet Operations</p>
        </div>
        
        <nav className="flex-1 px-sm space-y-xs mt-lg">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href;
            
            if (isActive) {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-md px-md py-sm rounded text-primary-fixed bg-on-primary-fixed-variant border-r-4 border-primary-fixed font-body-md text-body-md transition-colors scale-98 active:scale-95"
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.name}
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-md px-md py-sm rounded text-secondary-fixed-dim hover:text-white hover:bg-secondary-fixed-variant transition-colors font-body-md text-body-md scale-98 active:scale-95"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto px-sm pb-lg space-y-xs">
          <button className="w-full flex items-center gap-md px-md py-sm rounded text-secondary-fixed-dim hover:text-white hover:bg-secondary-fixed-variant transition-colors font-body-md text-body-md scale-98 active:scale-95">
            <span className="material-symbols-outlined">help</span>
            Help Support
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-md px-md py-sm rounded text-secondary-fixed-dim hover:text-white hover:bg-secondary-fixed-variant transition-colors font-body-md text-body-md scale-98 active:scale-95"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-[260px] min-h-screen flex flex-col flex-1 w-full">
        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center h-16 px-lg bg-surface border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-lg">
            <h2 className="font-headline-md text-headline-md font-bold text-primary capitalize">
              {location.pathname.replace('/', '') || 'Dashboard'}
            </h2>
            <div className="relative w-80 hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text" 
                className="w-full bg-surface-container-low border border-outline-variant rounded px-10 py-1.5 font-body-md text-body-md focus:outline-none focus:border-primary transition-all" 
                placeholder="Search vehicles or drivers..." 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-md">
            <button className="p-2 rounded hover:bg-surface-container-low transition-all duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="p-2 rounded hover:bg-surface-container-low transition-all duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
            
            <div className="h-8 w-[1px] bg-outline-variant mx-xs"></div>
            
            <button className="px-md py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-all rounded">Support</button>
            <button className="px-md py-2 bg-primary text-white font-label-md text-label-md rounded hover:bg-on-primary-fixed-variant transition-all">New Dispatch</button>
            
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden ml-xs border border-outline-variant text-primary font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-lg flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
