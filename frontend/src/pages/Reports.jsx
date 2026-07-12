import React from 'react';

const Reports = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-display text-display text-on-surface">Reports</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Real-time performance metrics for Regional Depot A</p>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-sm px-lg py-2 border border-outline-variant bg-white rounded-lg font-label-md text-on-surface hover:bg-surface-container-low transition-colors">
            <span>Export data</span>
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg h-full max-h-[1200px]">
        {/* 1. Fuel Efficiency */}
        <section className="bg-white border border-outline-variant rounded-lg p-md flex flex-col">
          <div className="mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Fuel efficiency</h3>
            <p className="text-on-surface-variant text-body-md">Comparison of average fuel consumption per kilometer across the fleet.</p>
          </div>
          <div className="flex-1 flex flex-col justify-end min-h-[300px] pt-md relative chart-container">
            <div className="flex items-end gap-md h-full px-lg border-b border-outline-variant pb-base ml-8">
              <div className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                <div className="w-full bg-primary/20 rounded-t-sm chart-bar relative transition-all duration-500 hover:opacity-80" style={{ height: '65%' }}>
                  <div className="absolute inset-0 bg-primary opacity-0 hover:opacity-100 transition-opacity rounded-t-sm"></div>
                </div>
                <span className="mt-sm font-label-sm text-on-surface-variant">V-102</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                <div className="w-full bg-primary/20 rounded-t-sm chart-bar relative transition-all duration-500 hover:opacity-80" style={{ height: '85%' }}>
                  <div className="absolute inset-0 bg-primary opacity-0 hover:opacity-100 transition-opacity rounded-t-sm"></div>
                </div>
                <span className="mt-sm font-label-sm text-on-surface-variant">V-105</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                <div className="w-full bg-primary/20 rounded-t-sm chart-bar relative transition-all duration-500 hover:opacity-80" style={{ height: '45%' }}>
                  <div className="absolute inset-0 bg-primary opacity-0 hover:opacity-100 transition-opacity rounded-t-sm"></div>
                </div>
                <span className="mt-sm font-label-sm text-on-surface-variant">V-201</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                <div className="w-full bg-primary/20 rounded-t-sm chart-bar relative transition-all duration-500 hover:opacity-80" style={{ height: '92%' }}>
                  <div className="absolute inset-0 bg-primary opacity-0 hover:opacity-100 transition-opacity rounded-t-sm"></div>
                </div>
                <span className="mt-sm font-label-sm text-on-surface-variant">V-204</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                <div className="w-full bg-primary/20 rounded-t-sm chart-bar relative transition-all duration-500 hover:opacity-80" style={{ height: '70%' }}>
                  <div className="absolute inset-0 bg-primary opacity-0 hover:opacity-100 transition-opacity rounded-t-sm"></div>
                </div>
                <span className="mt-sm font-label-sm text-on-surface-variant">V-302</span>
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between py-md pointer-events-none">
              <span className="text-label-sm text-on-surface-variant">12.0</span>
              <span className="text-label-sm text-on-surface-variant">6.0</span>
              <span className="text-label-sm text-on-surface-variant">0.0</span>
            </div>
          </div>
        </section>

        {/* 2. Fleet Utilization */}
        <section className="bg-white border border-outline-variant rounded-lg p-md flex flex-col">
          <div className="mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Fleet utilization</h3>
            <p className="text-on-surface-variant text-body-md">Current operational status across all registered vehicles.</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f1f5f9" strokeWidth="3"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#006a61" strokeDasharray="45 100" strokeWidth="3"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#565e74" strokeDasharray="30 100" strokeDashoffset="-45" strokeWidth="3"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#ffdad6" strokeDasharray="15 100" strokeDashoffset="-75" strokeWidth="3"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#e0e3e5" strokeDasharray="10 100" strokeDashoffset="-90" strokeWidth="3"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-lg font-bold">84%</span>
                <span className="text-label-sm text-on-surface-variant">Active</span>
              </div>
            </div>
            <div className="ml-lg space-y-sm">
              <div className="flex items-center gap-sm">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-label-md">Available (45%)</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-label-md">On Trip (30%)</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="w-3 h-3 rounded-full bg-error-container"></span>
                <span className="text-label-md">In Shop (15%)</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="w-3 h-3 rounded-full bg-surface-variant"></span>
                <span className="text-label-md">Retired (10%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Operational Cost */}
        <section className="bg-white border border-outline-variant rounded-lg p-md flex flex-col">
          <div className="mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Operational cost</h3>
            <p className="text-on-surface-variant text-body-md">Breakdown of total operational expenditures for top vehicles.</p>
          </div>
          <div className="flex-1 flex flex-col justify-end min-h-[300px] pt-md px-lg">
            <div className="flex items-end gap-lg h-full border-b border-outline-variant pb-base">
              <div className="flex-1 flex flex-col group/stack">
                <div className="w-full flex flex-col-reverse h-[240px]">
                  <div className="bg-primary h-[50%] w-full rounded-t-sm" title="Fuel: $1,200"></div>
                  <div className="bg-secondary h-[30%] w-full" title="Maintenance: $700"></div>
                  <div className="bg-tertiary-container h-[20%] w-full" title="Other: $450"></div>
                </div>
                <span className="mt-sm text-center font-label-sm text-on-surface-variant">V-102</span>
              </div>
              <div className="flex-1 flex flex-col group/stack">
                <div className="w-full flex flex-col-reverse h-[240px]">
                  <div className="bg-primary h-[40%] w-full rounded-t-sm"></div>
                  <div className="bg-secondary h-[45%] w-full"></div>
                  <div className="bg-tertiary-container h-[15%] w-full"></div>
                </div>
                <span className="mt-sm text-center font-label-sm text-on-surface-variant">V-105</span>
              </div>
              <div className="flex-1 flex flex-col group/stack items-center justify-center border-x border-dashed border-outline-variant h-[240px] bg-background/50">
                <span className="text-label-sm text-on-surface-variant text-center px-1">No data available</span>
              </div>
              <div className="flex-1 flex flex-col group/stack">
                <div className="w-full flex flex-col-reverse h-[240px]">
                  <div className="bg-primary h-[60%] w-full rounded-t-sm"></div>
                  <div className="bg-secondary h-[20%] w-full"></div>
                  <div className="bg-tertiary-container h-[20%] w-full"></div>
                </div>
                <span className="mt-sm text-center font-label-sm text-on-surface-variant">V-204</span>
              </div>
            </div>
            <div className="flex justify-center gap-lg mt-md">
              <div className="flex items-center gap-xs"><span className="w-2 h-2 bg-primary rounded-full"></span><span className="text-label-sm">Fuel</span></div>
              <div className="flex items-center gap-xs"><span className="w-2 h-2 bg-secondary rounded-full"></span><span className="text-label-sm">Maintenance</span></div>
              <div className="flex items-center gap-xs"><span className="w-2 h-2 bg-tertiary-container rounded-full"></span><span className="text-label-sm">Other</span></div>
            </div>
          </div>
        </section>

        {/* 4. Vehicle ROI */}
        <section className="bg-white border border-outline-variant rounded-lg p-md flex flex-col relative overflow-hidden">
          <div className="mb-md">
            <div className="flex justify-between items-start">
              <h3 className="font-headline-md text-headline-md text-on-surface">Vehicle ROI</h3>
              <div className="flex items-center gap-xs px-2 py-0.5 bg-surface-container rounded border border-outline-variant">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">info</span>
                <span className="text-label-sm text-on-surface-variant">Revenue not tracked</span>
              </div>
            </div>
            <p className="text-on-surface-variant text-body-md mt-1">Comparison of total operational investment per vehicle.</p>
          </div>
          <div className="flex-1 flex flex-col gap-sm pt-md">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-label-sm">
                <span className="font-bold">Heavy Hauler V-102</span>
                <span className="text-on-surface-variant">$24,200</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[75%] rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-label-sm">
                <span className="font-bold">Transit Van V-105</span>
                <span className="text-on-surface-variant">$18,450</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[60%] rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-label-sm">
                <span className="font-bold">Light Cargo V-201</span>
                <span className="text-on-surface-variant">$12,100</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%] rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-label-sm">
                <span className="font-bold">Regional Bus V-204</span>
                <span className="text-on-surface-variant">$31,000</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[90%] rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-label-sm">
                <span className="font-bold">Courier Van V-302</span>
                <span className="text-on-surface-variant">$9,800</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[35%] rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
