import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const KPICard = ({ title, value, icon, subtitle, colorClass, link, loading }) => (
  <Link to={link} className="bg-white border border-outline-variant rounded-lg p-lg hover:border-primary transition-colors group">
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-sm">
        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">{icon}</span>
        <span className={`text-label-sm font-semibold px-2 py-0.5 rounded ${colorClass.bg} ${colorClass.text}`}>
          {colorClass.label}
        </span>
      </div>
      {loading ? (
        <div className="kpi-value font-display text-display text-transparent mb-xs skeleton w-16 h-9 rounded">---</div>
      ) : (
        <div className="kpi-value font-display text-display text-on-surface mb-xs">{value}</div>
      )}
      <div className="font-headline-md text-headline-md text-on-surface-variant">{title}</div>
      <p className="mt-auto font-label-sm text-label-sm text-outline pt-md">{subtitle}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    inMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState('Just now');

  useEffect(() => {
    // Mock fetch for UI testing
    const timer = setTimeout(() => {
      setKpis({
        activeVehicles: 42,
        availableVehicles: 12,
        inMaintenance: 5,
        activeTrips: 38,
        pendingTrips: 14,
        driversOnDuty: 56,
        fleetUtilization: 84.2
      });
      setLoading(false);
      
      const now = new Date();
      setLastSync(`Last synced: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Filter Bar */}
      <section className="flex flex-wrap items-center gap-md mb-lg bg-white p-md rounded border border-outline-variant">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">filter_list</span>
          <span className="font-label-md text-label-md text-on-surface-variant">Filters:</span>
        </div>
        
        <div className="flex items-center gap-md">
          <select className="bg-surface-container-low border border-outline-variant rounded px-md py-1.5 font-body-md text-body-md text-on-surface focus:ring-0 focus:border-primary">
            <option value="all">Vehicle Type: All</option>
            <option value="truck">Semi Truck</option>
            <option value="van">Delivery Van</option>
            <option value="ev">Electric Fleet</option>
          </select>
          <select className="bg-surface-container-low border border-outline-variant rounded px-md py-1.5 font-body-md text-body-md text-on-surface focus:ring-0 focus:border-primary">
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="offline">Inactive Only</option>
          </select>
          <select className="bg-surface-container-low border border-outline-variant rounded px-md py-1.5 font-body-md text-body-md text-on-surface focus:ring-0 focus:border-primary">
            <option value="all">Region: Global</option>
            <option value="north">North Hub</option>
            <option value="east">East Corridor</option>
            <option value="west">West Coast</option>
          </select>
        </div>
        
        <div className="ml-auto">
          <span className="font-label-sm text-label-sm text-outline">{lastSync}</span>
        </div>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg max-w-[1400px] mx-auto">
        <KPICard 
          title="Active Vehicles"
          value={kpis.activeVehicles}
          icon="local_shipping"
          subtitle="Currently generating revenue"
          link="/vehicles?status=ON_TRIP"
          loading={loading}
          colorClass={{ bg: 'bg-primary/10', text: 'text-primary', label: 'On Trip' }}
        />
        
        <KPICard 
          title="Available Vehicles"
          value={kpis.availableVehicles}
          icon="check_circle"
          subtitle="Ready for new dispatch tasks"
          link="/vehicles?status=AVAILABLE"
          loading={loading}
          colorClass={{ bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Ready' }}
        />
        
        <KPICard 
          title="In Maintenance"
          value={kpis.inMaintenance}
          icon="build"
          subtitle="Scheduled or emergency repairs"
          link="/vehicles?status=IN_SHOP"
          loading={loading}
          colorClass={{ bg: 'bg-error-container', text: 'text-on-error-container', label: 'In Shop' }}
        />
        
        <KPICard 
          title="Active Trips"
          value={kpis.activeTrips}
          icon="route"
          subtitle="Monitored dispatches in progress"
          link="/trips?status=DISPATCHED"
          loading={loading}
          colorClass={{ bg: 'bg-primary/10', text: 'text-primary', label: 'In Transit' }}
        />
        
        <div className="hidden lg:block"></div> {/* Spacer */}
        
        <KPICard 
          title="Pending Trips"
          value={kpis.pendingTrips}
          icon="pending_actions"
          subtitle="Awaiting driver assignment"
          link="/trips?status=DRAFT"
          loading={loading}
          colorClass={{ bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: 'Draft' }}
        />
        
        <KPICard 
          title="Drivers On Duty"
          value={kpis.driversOnDuty}
          icon="badge"
          subtitle="Verified active driving hours"
          link="/drivers?status=ON_TRIP"
          loading={loading}
          colorClass={{ bg: 'bg-primary/10', text: 'text-primary', label: 'Logged In' }}
        />
        
        <div className="hidden lg:block"></div> {/* Spacer */}
        
        {/* Fleet Utilization (Centered Bottom Row) */}
        <div className="col-start-1 md:col-start-1 lg:col-start-2 lg:col-span-2 bg-white border border-outline-variant rounded-lg p-lg flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-sm mb-sm text-primary">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md uppercase tracking-wider">Utilization Rate</span>
          </div>
          {loading ? (
            <div className="kpi-value font-display text-[48px] leading-tight text-transparent mb-xs skeleton w-32 h-14 rounded">---</div>
          ) : (
            <div className="kpi-value font-display text-[48px] leading-tight text-on-surface mb-xs">{kpis.fleetUtilization}%</div>
          )}
          <div className="font-headline-md text-headline-md text-on-surface-variant">Total Fleet Utilization</div>
          <p className="font-label-sm text-label-sm text-outline mt-sm max-w-xs">Efficiency ratio of active vehicle hours vs available fleet capacity</p>
        </div>
      </div>

      {/* Dashboard Visual Asset Section */}
      <section className="mt-2xl grid grid-cols-1 md:grid-cols-12 gap-lg max-w-[1400px] mx-auto pb-12">
        <div className="col-span-1 md:col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-lg overflow-hidden h-[400px] relative">
          <div className="absolute top-md left-md z-10 bg-white/90 backdrop-blur border border-outline-variant px-md py-sm rounded">
            <h3 className="font-headline-md text-headline-md text-on-surface">Regional Logistics Heatmap</h3>
            <p className="font-label-sm text-label-sm text-outline">Real-time concentration of active dispatches</p>
          </div>
          <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnb1S5etnbCkKDolr_TVJSGJXCtAJAv9eDh2t7C3moe8SMc01d_82dnn7uKBg8Y-jyyQTgafC5PDlWXKS9UO-o9DNlqDElV0zxyE5w_7W1AhkJfXmyMaqD4dPkZ-qN-LpvrzcQSAyJESJ4QeE5z5iI5rTX0ebwPRwtCFoaPuAHdB2ttFmVg4zwYnT1yZ4Ouk7CmSMNCOahJEt2El7w-02xDeNN8pPNhx6QBR8QY52HOgPynFF3UV0')" }}
            ></div>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded-lg p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface">Live Event Stream</h3>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-on-surface">more_vert</span>
          </div>
          
          <div className="space-y-lg">
            <div className="flex gap-md border-l-2 border-primary pl-md py-xs">
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">Dispatch #TR-8922 Departed</p>
                <p className="font-label-sm text-label-sm text-outline">Truck 04 • Driver: Mark R. • 2 mins ago</p>
              </div>
            </div>
            <div className="flex gap-md border-l-2 border-outline-variant pl-md py-xs">
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">Maintenance Alert: Van 12</p>
                <p className="font-label-sm text-label-sm text-outline">Service required: Brake inspection • 15 mins ago</p>
              </div>
            </div>
            <div className="flex gap-md border-l-2 border-primary pl-md py-xs">
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">New Hub Arrival: Trailer 09</p>
                <p className="font-label-sm text-label-sm text-outline">North Hub Logistics Center • 42 mins ago</p>
              </div>
            </div>
            <div className="flex gap-md border-l-2 border-outline-variant pl-md py-xs">
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">Schedule Conflict Detected</p>
                <p className="font-label-sm text-label-sm text-outline">Route 22B overlaps Driver Shift • 1 hour ago</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-xl py-2 border border-outline-variant rounded font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-all">
            View All Activity
          </button>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
